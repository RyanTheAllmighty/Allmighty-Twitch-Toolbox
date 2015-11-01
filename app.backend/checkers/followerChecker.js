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
    let async = require('async');

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
                let offset = 0;
                let added = 0;

                global.services.settings.get('twitch', 'username').then(function (username) {
                    async.doWhilst(
                        function (cb) {
                            global.services.twitchAPI.getChannelFollows(username.value, {limit: 100, offset, direction: 'DESC'}, function (err, followers) {
                                if (err) {
                                    return cb(err);
                                }

                                added = 0;

                                async.each(followers.follows, function (follow, next) {
                                    global.services.followers.process({
                                        date: new Date(follow.created_at),
                                        id: follow.user._id,
                                        username: follow.user.name,
                                        display_name: follow.user.display_name
                                    }, {noNotification: true, errorOnNonNew: true}).then(function () {
                                        added++;

                                        next();
                                    }).catch(function (err) {
                                        if (err && err.message !== 'Non new follower') {
                                            return next(err);
                                        }

                                        next();
                                    });
                                }, function (err) {
                                    if (err) {
                                        return cb(err);
                                    }

                                    offset += 100;

                                    // Twitch only allows looking at followers up to offset 1700
                                    if (offset === 1700) {
                                        added = 0;
                                    }

                                    cb();
                                });
                            });
                        },
                        function () {
                            return added !== 0;
                        },
                        function (err) {
                            if (err) {
                                self[objectSymbol].doingInitialCheck = false;

                                return reject(err);
                            }

                            self[objectSymbol].doingInitialCheck = false;

                            return resolve();
                        }
                    );
                }).catch(reject);
            });
        }

        startChecking() {
            let self = this;

            return new Promise(function (resolve, reject) {
                if (self.doingInitialCheck) {
                    return reject(new Error('Doing initial check! Please wait until done!'));
                }

                if (self.interval) {
                    return reject(new Error('Follower Checker already started!'));
                }

                self.doInitialCheck().then(function () {
                    global.services.settings.getAll().then(function (settings) {
                        // Save this interval so we can cancel it if we get another one later
                        self[objectSymbol].interval = setInterval(function () {
                            global.services.twitchAPI.getChannelFollows(_.result(_.findWhere(settings, {group: 'twitch', name: 'username'}), 'value'), {
                                limit: 25,
                                direction: 'DESC'
                            }, function (err, followers) {
                                if (err) {
                                    return console.error(err);
                                }

                                async.each(followers.follows, function (follow, next) {
                                    global.services.followers.process({
                                        date: new Date(follow.created_at),
                                        id: follow.user._id,
                                        username: follow.user.name,
                                        display_name: follow.user.display_name
                                    }).then(function () {
                                        next();
                                    }).catch(next);
                                }, function (err) {
                                    if (err) {
                                        return console.error(err);
                                    }
                                });
                            });
                        }, _.result(_.findWhere(settings, {group: 'checks', name: 'followers'}), 'value') * 1000);

                        return resolve();
                    }).catch(reject);
                }).catch(reject);
            });
        }

        stopChecking() {
            let self = this;

            return new Promise(function (resolve, reject) {
                if (!self.interval) {
                    return reject(new Error('Follower Checker not started!'));
                }

                clearInterval(self.interval);

                self[objectSymbol].interval = null;

                return resolve();
            });
        }
    }

    module.exports = FollowerChecker;
})();