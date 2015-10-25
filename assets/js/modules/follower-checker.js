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

    let async = require('async');

    angular.module('follower-checker', []);

    angular.module('follower-checker').provider('FollowerChecker', function () {
        this.options = {
            interval: 10
        };

        /**
         * This is our promise that is kept when we start the interval so that we can cancel it if we need to.
         */
        this.promise = null;

        this.doingInitialCheck = false;

        this.setOptions = function (options) {
            if (!angular.isObject(options)) {
                throw new Error('Options should be an object!');
            }

            this.options = angular.extend({}, this.options, options);
        };

        this.$get = ['$rootScope', '$interval', 'Followers', 'Twitch', function ($rootScope, $interval, Followers, Twitch) {
            let self = this;

            return {
                changeInterval: function (interval) {
                    self.options.interval = interval;
                    self.startChecking();
                },
                /**
                 * Does an initial check to get any new followers since we last fired it up.
                 *
                 * Due to Twitch API limits we can only get the first 1700ish followers, so refollows may or may not become an issue depending on how many followers you have.
                 *
                 * @param callback
                 */
                doInitialCheck: function (callback) {
                    self.doingInitialCheck = true;

                    let moreToDo = true;
                    let offset = 0;

                    async.doWhilst(
                        function (cb) {
                            Twitch.getChannelFollows($rootScope.App.settings.twitch.username, {limit: 100, offset, direction: 'DESC'}, function (err, followers) {
                                if (err) {
                                    return cb(err);
                                }

                                async.each(followers.follows, function (follow, next) {
                                    Followers.processFollower({
                                        date: new Date(follow.created_at),
                                        id: follow.user._id,
                                        username: follow.user.name,
                                        display_name: follow.user.display_name
                                    }, {noNotification: true, errorOnNonNew: true}, function (err) {
                                        if (err && err.message === 'Non new follower') {
                                            moreToDo = false;
                                        } else if (err) {
                                            next(err);
                                        }

                                        next();
                                    });
                                }, function (err) {
                                    if (err) {
                                        return cb(err);
                                    }

                                    offset += 100;

                                    if (offset === 1700) {
                                        moreToDo = false;
                                    }

                                    cb();
                                });
                            });
                        },
                        function () {
                            return moreToDo;
                        },
                        function (err) {
                            if (err) {
                                console.error(err);
                            }

                            console.log('Initial check of followers done!');

                            self.doingInitialCheck = false;
                            callback();
                        }
                    );
                },
                startChecking: function () {
                    if (self.doingInitialCheck) {
                        return;
                    }

                    if (self.promise) {
                        $interval.cancel(self.promise);
                    }

                    this.doInitialCheck(function () {
                        // Save this timeout promise so we can cancel it if we get another one later
                        self.promise = $interval(function () {
                            Twitch.getChannelFollows($rootScope.App.settings.twitch.username, {limit: 25, direction: 'DESC'}, function (err, followers) {
                                if (err) {
                                    return console.error(err);
                                }

                                async.each(followers.follows, function (follow, next) {
                                    Followers.processFollower({
                                        date: new Date(follow.created_at),
                                        id: follow.user._id,
                                        username: follow.user.name,
                                        display_name: follow.user.display_name
                                    }, next);
                                }, function (err) {
                                    if (err) {
                                        return console.error(err);
                                    }
                                });
                            });
                        }, self.options.interval * 1000);
                    });
                }
            };
        }];
    });
})();