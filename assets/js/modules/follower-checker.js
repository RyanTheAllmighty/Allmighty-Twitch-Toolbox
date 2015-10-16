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

'use strict';

angular.module('follower-checker', []);

let promise;

angular.module('follower-checker').provider('FollowerChecker', function () {
    this.options = {
        interval: 10
    };

    this.setOptions = function (options) {
        if (!angular.isObject(options)) {
            throw new Error('Options should be an object!');
        }

        this.options = angular.extend({}, this.options, options);
    };

    this.$get = ['$interval', 'Followers', function ($interval, Followers) {
        let self = this;

        return {
            changeInterval: function (interval) {
                self.options.interval = interval;
                self.startChecking();
            },
            startChecking: function () {
                if (promise) {
                    $interval.cancel(promise);
                }

                // Save this timeout promise so we can cancel it if we get another one later
                promise = $interval(function () {
                    Followers.newFollower({
                        username: 'Test',
                        date: new Date()
                    });
                }, self.options.interval * 1000);
            }
        };
    }];
});