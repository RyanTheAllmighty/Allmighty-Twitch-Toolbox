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

    let Datastore = require('./datastore');

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