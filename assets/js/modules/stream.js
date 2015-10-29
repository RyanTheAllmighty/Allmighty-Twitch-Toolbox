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

    let _ = require('lodash');

    angular.module('stream', []);

    angular.module('stream').provider('Stream', function () {
        this.$get = ['$rootScope', 'SocketIOServer', 'Followers', 'Donations', function ($rootScope, SocketIOServer, Followers, Donations) {
            return {
                nowOnline: function (callback) {
                    this.isOnline(function (online) {
                        if (!online) {
                            Followers.getFollowerCount(function (err, followers) {
                                if (err) {
                                    return console.error(err);
                                }

                                Donations.getDonationTotal(function (err, donations) {
                                    if (err) {
                                        return console.error(err);
                                    }

                                    let statusData = {online: true, followers, donations, date: new Date()};

                                    $rootScope.App.db.stream.insert(statusData, function (err) {
                                        if (err) {
                                            return callback(err);
                                        }

                                        $rootScope.$broadcast('stream-online', statusData);
                                        SocketIOServer.emit('stream-online', statusData);

                                        callback(null, statusData);
                                    });
                                });
                            });
                        }
                    });
                },
                nowOffline: function (callback) {
                    this.isOnline(function (online) {
                        $rootScope.App.db.stream.count({}).exec(function (err, count) {
                            if (err) {
                                console.error(err);
                                return callback(false);
                            }


                            if (online || count === 0) {
                                Followers.getFollowerCount(function (err, followers) {
                                    if (err) {
                                        return console.error(err);
                                    }

                                    Donations.getDonationTotal(function (err, donations) {
                                        if (err) {
                                            return console.error(err);
                                        }

                                        let statusData = {online: false, followers, donations, date: new Date()};

                                        $rootScope.App.db.stream.insert(statusData, function (err) {
                                            if (err) {
                                                return callback(err);
                                            }

                                            $rootScope.$broadcast('stream-offline', statusData);
                                            SocketIOServer.emit('stream-offline', statusData);

                                            callback(null, statusData);
                                        });
                                    });
                                });
                            }
                        });
                    });
                },
                isOnline: function (callback) {
                    $rootScope.App.db.stream.find({}).sort({date: -1}).limit(1).exec(function (err, docs) {
                        if (err) {
                            console.error(err);
                            return callback(false);
                        }

                        if (docs.length === 0) {
                            return callback(false);
                        }

                        callback(docs[0].online);
                    });
                },
                getLastStatus: function (callback) {
                    let self = this;

                    $rootScope.App.db.stream.find({}).sort({date: -1}).limit(1).exec(function (err, docs) {
                        if (err) {
                            return callback(err);
                        }

                        if (docs.length === 0) {
                            return self.nowOffline(function (err, data) {
                                if (err) {
                                    return callback(err);
                                }

                                callback(null, data);
                            });
                        }

                        callback(null, _.pick(docs[0], ['followers', 'donations', 'date', 'online']));
                    });
                }
            };
        }];
    });
})();