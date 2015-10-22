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

    angular.module('notification-queue', []);

    angular.module('notification-queue').provider('NotificationQueue', function () {
        this.queue = [];

        this.resolving = null;

        this.promise = null;

        this.$get = ['$injector', '$interval', function ($injector, $interval) {
            let self = this;

            return {
                add: function (item) {
                    console.log('Added item to queue!');
                    self.queue.push(item);
                },
                isRunning: function () {
                    return self.promise !== null;
                },
                inQueue: function () {
                    return self.queue.length;
                },
                startQueue: function () {
                    if (!self.promise) {
                        self.promise = $interval(function () {
                            if (!self.resolving && self.queue.length !== 0) {
                                console.log('Resolving new item!');
                                self.resolving = self.queue.shift();

                                self.resolving.resolve($injector, function () {
                                    console.log('Item resolved!');
                                    self.resolving = null;
                                });
                            } else if (self.resolving) {
                                console.log('Already resolving an item!');
                            } else {
                                console.log('No items to resolve!');
                            }
                        }, 1000);
                    }
                },
                stopQueue: function () {
                    if (self.promise) {
                        $interval.cancel(self.promise);
                        self.promise = null;
                    }
                }
            };
        }];
    });
})();