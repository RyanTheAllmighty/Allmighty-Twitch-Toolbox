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

        this.$get = ['$rootScope', '$interval', 'Stream', 'Twitch', 'Viewers', function ($rootScope, $interval, Stream, Twitch, Viewers) {
            let self = this;

            return {
                changeInterval: function (interval) {
                    self.options.interval = interval;
                    self.startChecking();
                },
                startChecking: function () {
                    if (self.promise) {
                        $interval.cancel(self.promise);
                    }

                    self.promise = $interval(function () {
                        Twitch.getChannelStream($rootScope.App.settings.twitch.username, function (err, info) {
                            if (err) {
                                return console.error(err);
                            }

                            if (info.stream) {
                                Stream.nowOnline();
                                Viewers.addViewerCount(info.stream.viewers || 0);
                            } else {
                                Stream.nowOffline();
                            }
                        });
                    }, 30000);
                }
            };
        }];
    });
})();