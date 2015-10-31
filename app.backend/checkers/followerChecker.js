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
    let path = require('path');
    let async = require('async');

    // Include our services module
    let services = require(path.join(process.cwd(), 'app.backend', 'services'));

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
            console.log(2);
            let self = this;

            this[objectSymbol].doingInitialCheck = true;

            return new Promise(function (resolve, reject) {
                console.log(3);
                let offset = 0;
                let added = 0;

                console.log(4);
                services.settings.get('twitch', 'username').then(function (username) {
                    console.log(4);
                    async.doWhilst(
                        function (cb) {
                            services.twitchAPI.getChannelFollows(username.value, {limit: 100, offset, direction: 'DESC'}, function (err, followers) {
                                console.log(5);
                                if (err) {
                                    return cb(err);
                                }

                                added = 0;

                                async.each(followers.follows, function (follow, next) {
                                    services.followers.process({
                                        date: new Date(follow.created_at),
                                        id: follow.user._id,
                                        username: follow.user.name,
                                        display_name: follow.user.display_name
                                    }, {noNotification: true, errorOnNonNew: true}).then(function () {
                                        next();
                                    }).catch(function (err) {
                                        if (err && err.message !== 'Non new follower') {
                                            next(err);
                                        }

                                        added++;

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
                            console.log(6);
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

                console.log(1);
                self.doInitialCheck().then(function () {
                    console.log(7);
                    services.settings.getAll().then(function (settings) {
                        // Save this interval so we can cancel it if we get another one later
                        self[objectSymbol].interval = setInterval(function () {
                            services.twitchAPI.getChannelFollows(_.result(_.findWhere(settings, {group: 'twitch', name: 'username'}), 'value'), {
                                limit: 25,
                                direction: 'DESC'
                            }, function (err, followers) {
                                if (err) {
                                    return console.error(err);
                                }

                                async.each(followers.follows, function (follow, next) {
                                    services.followers.process({
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
                    });
                });
            });
        }

        stopChecking() {
            let self = this;

            return new Promise(function (resolve, reject) {
                if (!self.interval) {
                    return reject(new Error('Queue not started!'));
                }

                clearInterval(self.interval);

                self[objectSymbol].interval = null;

                return resolve();
            });
        }
    }

    module.exports = FollowerChecker;
})();