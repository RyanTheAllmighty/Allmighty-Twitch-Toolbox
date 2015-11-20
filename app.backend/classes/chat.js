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
            global.services.socketIOEmit('twitch-chat-slowmode', {enabled, length});
        }

        parseSubmode(enabled) {
            global.services.socketIOEmit('twitch-chat-submode', {enabled});
        }

        parse(details) {
            if (this.datastore) {
                if (!details.date) {
                    details.date = new Date();
                }

                details.index = index++;

                this.datastore.insert(details, function (err) {
                    if (!err) {
                        global.services.socketIOEmit('twitch-chat-message', _.omit(details, 'index'));
                    }
                });
            }
        }

        parseTimeout(username) {
            global.services.socketIOEmit('twitch-chat-timeout', username);
        }

        ban(username) {
            return new Promise(function (resolve, reject) {
                global.services.settings.get('twitch', 'auth').then(function (setting) {
                    global.services.twitchChatClient.ban(setting.value.username, username);

                    return resolve();
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

                    return resolve();
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