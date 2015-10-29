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

    angular.module('stream-checker', []);

    angular.module('stream-checker').provider('StreamChecker', function () {
        this.options = {
            interval: 10
        };

        /**
         * This is our promise that is kept when we start the interval so that we can cancel it if we need to.
         */
        this.promise = null;

        this.setOptions = function (options) {
            if (!angular.isObject(options)) {
                throw new Error('Options should be an object!');
            }

            this.options = angular.extend({}, this.options, options);
        };

        /**
         * This is our promise that is kept when we start the interval so that we can cancel it if we need to.
         */
        this.promise = null;

        this.doingInitialCheck = false;

        this.$get = ['$rootScope', '$interval', 'Stream', 'Twitch', 'Viewers', function ($rootScope, $interval, Stream, Twitch, Viewers) {
            let thisModule = this;

            return {
                changeInterval: function (interval) {
                    thisModule.options.interval = interval;
                    thisModule.startChecking();
                },
                doInitialCheck: function (callback) {
                    thisModule.doingInitialCheck = true;

                    this.check(function (err) {
                        if (err) {
                            console.error(err);
                        }

                        console.log('Initial check of stream done!');

                        thisModule.doingInitialCheck = false;

                        callback();
                    });
                },
                check: function (callback) {
                    Twitch.getChannel($rootScope.App.settings.twitch.username, function (err, channelInfo) {
                        if (err) {
                            return callback(err);
                        }

                        Twitch.getChannelStream($rootScope.App.settings.twitch.username, function (err, streamInfo) {
                            if (err) {
                                return callback(err);
                            }

                            Stream.processInfo(channelInfo, streamInfo, function (err) {
                                if (err) {
                                    return callback(err);
                                }

                                if (streamInfo.stream) {
                                    Viewers.addViewerCount(streamInfo.stream.viewers || 0, callback);
                                } else {
                                    callback();
                                }
                            });

                        });
                    });
                },
                startChecking: function (callback) {
                    let self = this;

                    if (thisModule.doingInitialCheck) {
                        return callback();
                    }

                    if (thisModule.promise) {
                        $interval.cancel(thisModule.promise);
                    }

                    this.doInitialCheck(function () {
                        thisModule.promise = $interval(function () {
                            self.check(function (err) {
                                if (err) {
                                    console.error(err);
                                }
                            });
                        }, thisModule.options.interval);

                        callback();
                    });
                }
            };
        }];
    });
})();