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
    let request = require('request');
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
            this.bttvEmotes = [];

            let self = this;
            request({method: 'get', url: 'https://api.betterttv.net/2/emotes', json: true}, function (err, res, body) {
                if (!err && body.emotes) {
                    self.bttvEmotes = body.emotes;
                }
            });
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

        formatTwitchEmotes(text, emotes) {
            let splitText = text.split('');

            _.foreach(emotes, function (i) {
                let e = emotes[i];

                _.foreach(e, function (j) {
                    let mote = e[j];
                    if (typeof mote === 'string') {
                        mote = mote.split('-');
                        mote = [parseInt(mote[0]), parseInt(mote[1])];

                        let length = mote[1] - mote[0];
                        let empty = Array.apply(null, new Array(length + 1)).map(function () {
                            return '';
                        });

                        splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length));
                        splitText.splice(mote[0], 1, '<img class="twitch-chat-emoticon" src="http://static-cdn.jtvnw.net/emoticons/v1/' + i + '/3.0">');
                    }
                });
            });

            return splitText.join('');
        }

        formatBTTVEmotes(text) {
            _.forEach(this.bttvEmotes, function (emote) {
                let emoteURL = 'https://cdn.betterttv.net/emote/' + emote.id + '/3x';

                let index = text.indexOf(emote.code);

                while (index !== -1) {
                    text = text.substr(0, parseInt(index)) + '<img class="twitch-chat-emoticon" src="' + emoteURL + '" />' +
                        text.substring(parseInt(index + emote.code.length) + 1);

                    index = text.indexOf(emote.code);
                }
            });

            return text;
        }

        parseChat(user, message) {
            let rawMessage = message;

            // Twitch Emotes
            if (user.emotes) {
                message = this.formatTwitchEmotes(message, user.emotes);
            }

            // BTTV emotes
            message = this.formatBTTVEmotes(message);

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