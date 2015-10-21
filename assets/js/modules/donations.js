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

    angular.module('donations', []);

    angular.module('donations').provider('Donations', function () {
        this.$get = ['$q', '$rootScope', 'SocketIOServer', 'Notifications', function ($q, $rootScope, SocketIOServer, Notifications) {
            console.log('Donations::$get()');
            return {
                getDonations: function (limit, callback) {
                    if (limit && !callback) {
                        callback = limit;
                        limit = 100;
                    }

                    $rootScope.App.db.donations.find({}).sort({date: 1}).limit(limit).exec(callback);
                },
                getDonationsPromise: function (limit) {
                    let self = this;

                    return $q(function (resolve, reject) {
                        self.getDonations(limit, function (err, donations) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(donations);
                            }
                        });
                    });
                },
                getDonationCount: function (callback) {
                    $rootScope.App.db.donations.count({}).exec(callback);
                },
                getDonationTotal: function (callback) {
                    $rootScope.App.db.donations.find({}).exec(function (err, docs) {
                        if (err) {
                            return callback(err);
                        }

                        callback(null, _.reduce(docs, function (total, doc) {
                            return total + doc.amount;
                        }));
                    });
                },
                processDonation: function (donation, callback) {
                    let self = this;

                    if (!donation.date) {
                        donation.date = new Date();
                    }

                    $rootScope.App.db.donations.find({id: donation.id}).limit(1).exec(function (err, docs) {
                        if (err) {
                            return callback(err);
                        }

                        if (docs.length === 0) {
                            // New donation
                            self.newDonation(donation, callback);
                        }
                    });
                },
                newDonation: function (donation, callback) {
                    if (!donation.date) {
                        donation.date = new Date();
                    }

                    function notify(err) {
                        if (err) {
                            return callback(err);
                        }

                        // Send a desktop notification
                        Notifications.notify('New Donation!', donation.username + ' just donated $' + donation.amount + '!', {
                            url: $rootScope.App.settings.sounds.newDonation,
                            volume: $rootScope.App.settings.sounds.newDonationVolume
                        });

                        // Send a broadcast to listening scopes
                        $rootScope.$broadcast('new-donation', donation);
                        $rootScope.$broadcast('donations');

                        // Send a broadcast to listening socket clients
                        SocketIOServer.emit('new-donation', donation, function (err) {
                            if (err) {
                                return callback(err);
                            }

                            SocketIOServer.emit('donations', callback);
                        });
                    }

                    if (!donation.test) {
                        $rootScope.App.db.donations.update({id: donation.id}, donation, {upsert: true}, notify);
                    } else {
                        notify();
                    }
                }
            };
        }];
    });
})();