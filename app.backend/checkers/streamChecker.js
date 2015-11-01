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

    // NodeJS Modules
    let _ = require('lodash');

    let objectSymbol = Symbol();

    class FollowerChecker {
        constructor() {
            this[objectSymbol] = {
                doingInitialCheck: false,
                interval: null
            };
        }

        get interval() {
            return this[objectSymbol].interval;
        }

        get doingInitialCheck() {
            return this[objectSymbol].doingInitialCheck;
        }

        doInitialCheck() {
            let self = this;

            this[objectSymbol].doingInitialCheck = true;

            return new Promise(function (resolve, reject) {
                global.services.settings.get('twitch', 'username').then(function (username) {
                    self.check(username.value).then(function () {
                        self[objectSymbol].doingInitialCheck = false;

                        return resolve();
                    }).catch(reject);
                }).catch(reject);
            });
        }

        check(username) {
            return new Promise(function (resolve, reject) {
                global.services.twitchAPI.getChannel(username, function (err, channelInfo) {
                    if (err) {
                        return reject(err);
                    }

                    global.services.twitchAPI.getChannelStream(username, function (err, streamInfo) {
                        if (err) {
                            return reject(err);
                        }

                        global.services.stream.processInfo(channelInfo, streamInfo).then(function () {
                            if (streamInfo.stream) {
                                global.services.viewers.addViewerCount(streamInfo.stream.viewers || 0).then(function () {
                                    return resolve();
                                }).catch(reject);
                            } else {
                                resolve();
                            }
                        }).catch(reject);
                    });
                });
            });
        }

        startChecking() {
            let self = this;

            return new Promise(function (resolve, reject) {
                if (self.doingInitialCheck) {
                    return reject(new Error('Doing initial check! Please wait until done!'));
                }

                if (self.interval) {
                    return reject(new Error('Stream Checker already started!'));
                }

                self.doInitialCheck().then(function () {
                    global.services.settings.getAll().then(function (settings) {
                        // Save this interval so we can cancel it if we get another one later
                        self[objectSymbol].interval = setInterval(function () {
                            self.check(_.result(_.findWhere(settings, {group: 'twitch', name: 'username'}), 'value')).catch(function (err) {
                                if (err) {
                                    console.error(err);
                                }
                            });
                        }, _.result(_.findWhere(settings, {group: 'checks', name: 'stream'}), 'value') * 1000);

                        return resolve();
                    }).catch(reject);
                }).catch(reject);
            });
        }

        stopChecking() {
            let self = this;

            return new Promise(function (resolve, reject) {
                if (!self.interval) {
                    return reject(new Error('Stream Checker not started!'));
                }

                clearInterval(self.interval);

                self[objectSymbol].interval = null;

                return resolve();
            });
        }
    }

    module.exports = FollowerChecker;
})();