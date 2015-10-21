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

    angular.module('donation-checker', []);

    angular.module('donation-checker').provider('DonationChecker', function () {
        this.options = {
            interval: 10
        };

        /**
         * This is our promise that is kept when we start the interval so that we can cancel it if we need to.
         */
        this.promise = null;

        this.setOptions = function (options) {
            console.log('DonationCheckerProvider::setOptions()');
            if (!angular.isObject(options)) {
                throw new Error('Options should be an object!');
            }

            this.options = angular.extend({}, this.options, options);
        };

        this.$get = ['$interval', 'Donations', 'StreamTip', function ($interval, Donations, StreamTip) {
            console.log('DonationCheckerProvider::$get()');
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

                    // Save this timeout promise so we can cancel it if we get another one later
                    self.promise = $interval(function () {
                        StreamTip.getTips({limit: 10}, function (err, tips) {
                            if (err) {
                                return console.error(err);
                            }

                            async.each(tips.tips, function (tip, next) {
                                Donations.processDonation({
                                    date: new Date(tip.date),
                                    id: tip._id,
                                    username: tip.username,
                                    amount: parseFloat(tip.amount),
                                    note: tip.note
                                }, next);
                            }, function (err) {
                                if (err) {
                                    return console.error(err);
                                }
                            });
                        });
                    }, self.options.interval * 1000);
                }
            };
        }];
    });
})();