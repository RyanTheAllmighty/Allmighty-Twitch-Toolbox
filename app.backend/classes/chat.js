/*
 * Allmighty Twitch Toolbox - https://github.com/RyanTheAllmighty/Allmighty-Twitch-Toolbox
 * Copyright (C) 2015 RyanTheAllmighty
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

(function () {
    'use strict';

    let path = require('path');
    let accounting = require('accounting');

    let Datastore = require('./datastore');
    let QueueableNotification = require(path.join(process.cwd(), 'app.backend', 'classes', 'queueableNotification'));

    let _ = require('lodash');

    let index = 1;

    class Chat extends Datastore {
        constructor(options) {
            super('chat', options);

            if (options.inMemoryOnly) {
                let self = this;

                setInterval(function () {
                    if (index >= 100) {
                        self.datastore.remove({index: {$lt: index - 100}}, {multi: true}, function () {
                            self.datastore.persistence.compactDatafile();
                        });
                    }
                }, 60000);
            }

            this.chatState = {};
        }

        hosted(username, viewers, options) {
            return new Promise(function (resolve, reject) {
                if (options.noNotification) {
                    return resolve();
                }

                global.services.settings.getAll().then(function (settings) {
                    let noti = new QueueableNotification()
                        .title('Channel Hosted!')
                        .message(username + ' has hosted the channel for ' + accounting.formatNumber(viewers) + ' viewer' + (viewers === 1 ? '' : 's') + '!')
                        .timeout(_.result(_.findWhere(settings, {group: 'notifications', name: 'channelHostedNotificationTime'}), 'value') * 1000)
                        .socketIO('channel-hosted', {username, viewers})
                        .sound(_.result(_.findWhere(settings, {group: 'sounds', name: 'channelHosted'}), 'value'), _.result(_.findWhere(settings, {
                            group: 'sounds',
                            name: 'channelHostedVolume'
                        }), 'value'));

                    global.services.notificationQueue.add(noti);

                    return resolve();
                }).catch(reject);
            });
        }

        parseSlowmode(enabled, length) {
            this.chatState.slow = enabled;
            global.services.socketIOEmit('twitch-chat-slowmode', {enabled, length});
        }

        parseSubmode(enabled) {
            this.chatState['subs-only'] = enabled;
            global.services.socketIOEmit('twitch-chat-submode', {enabled});
        }

        parseState(state) {
            this.chatState = state;
        }

        getState() {
            let self = this;

            return new Promise(function (resolve) {
                return resolve(self.chatState);
            });
        }

        parseChat(user, message) {
            let rawMessage = message;

            if (user.emotes) {
                _.forEach(user.emotes, function (locations, key) {
                    let emoteURL = 'http://static-cdn.jtvnw.net/emoticons/v1/' + key + '/3.0';

                    _.forEach(locations, function (location) {
                        let locationParts = location.split('-');

                        message = message.substr(0, parseInt(locationParts[0])) + '<img class="twitch-chat-emoticon" src="' + emoteURL + '" />' +
                            message.substring(parseInt(locationParts[1]) + 1);
                    });
                });
            }

            this.saveChat({user, message, rawMessage});
        }

        parseNotice(msgid, message) {
            this.saveChat({notice: msgid, message, rawMessage: message});
        }

        saveChat(data) {
            if (this.datastore) {
                if (!data.date) {
                    data.date = new Date();
                }

                data.index = index++;

                this.datastore.insert(data, function (err) {
                    if (!err) {
                        global.services.socketIOEmit('twitch-chat-message', _.omit(data, 'index'));
                    }
                });
            }
        }

        parseTimeout(username) {
            global.services.socketIOEmit('twitch-chat-timeout', username);
        }

        ban(username) {
            let self = this;

            return new Promise(function (resolve, reject) {
                global.services.settings.get('twitch', 'auth').then(function (setting) {
                    global.services.twitchChatClient.ban(setting.value.username, username);

                    self.datastore.update({'user.username': username}, {$set: {deleted: true}}, {multi: true}, function (err) {
                        if (err) {
                            return reject(err);
                        }

                        return resolve();
                    });
                }).catch(reject);
            });
        }

        clear() {
            return new Promise(function (resolve, reject) {
                global.services.settings.get('twitch', 'auth').then(function (setting) {
                    global.services.twitchChatClient.clear(setting.value.username);

                    return resolve();
                }).catch(reject);
            });
        }

        slowmode(enabled, seconds) {
            return new Promise(function (resolve, reject) {
                global.services.settings.get('twitch', 'auth').then(function (setting) {
                    if (enabled) {
                        global.services.twitchChatClient.slow(setting.value.username, seconds);
                    } else {
                        global.services.twitchChatClient.slowoff(setting.value.username);
                    }

                    return resolve();
                }).catch(reject);
            });
        }

        submode(enabled) {
            return new Promise(function (resolve, reject) {
                global.services.settings.get('twitch', 'auth').then(function (setting) {
                    if (enabled) {
                        global.services.twitchChatClient.subscribers(setting.value.username);
                    } else {
                        global.services.twitchChatClient.subscribersoff(setting.value.username);
                    }

                    return resolve();
                }).catch(reject);
            });
        }

        timeout(username, seconds) {
            let self = this;

            return new Promise(function (resolve, reject) {
                global.services.settings.get('twitch', 'auth').then(function (setting) {
                    global.services.twitchChatClient.timeout(setting.value.username, username, seconds);

                    self.parseTimeout(username);

                    self.datastore.update({'user.username': username}, {$set: {deleted: true}}, {multi: true}, function (err) {
                        if (err) {
                            return reject(err);
                        }

                        return resolve();
                    });
                }).catch(reject);
            });
        }

        say(message) {
            return new Promise(function (resolve, reject) {
                global.services.settings.get('twitch', 'auth').then(function (setting) {
                    global.services.twitchChatClient.say(setting.value.username, message);

                    return resolve();
                }).catch(reject);
            });
        }

        getAll() {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.datastore.find({}).sort({date: 1}).exec(function (err, data) {
                    if (err) {
                        return reject(err);
                    }

                    data = _.map(data, function (entry) {
                        return _.omit(entry, ['index', '_id']);
                    });

                    return resolve(data);
                });
            });
        }
    }

    module.exports = Chat;
})();