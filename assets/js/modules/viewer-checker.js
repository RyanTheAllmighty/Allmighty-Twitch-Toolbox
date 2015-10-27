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

    angular.module('viewer-checker', []);

    angular.module('viewer-checker').provider('ViewerChecker', function () {
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

        this.$get = ['$rootScope', '$interval', 'Viewers', 'Twitch', function ($rootScope, $interval, Viewers, Twitch) {
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

                            console.log(JSON.stringify(info));

                            if (info.stream) {
                                Viewers.addViewerCount(info.stream.viewers || 0);
                            }
                        });
                    }, self.options.interval * 1000);
                }
            };
        }];
    });
})();