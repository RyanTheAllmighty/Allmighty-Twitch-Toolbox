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

    angular.module('stream', []);

    angular.module('stream').provider('Stream', function () {
        this.$get = ['$rootScope', 'SocketIOServer', function ($rootScope, SocketIOServer) {
            return {
                nowOnline: function (callback) {
                    this.isOnline(function (online) {
                        if (!online) {
                            $rootScope.App.db.stream.insert({online: true, date: new Date()}, function (err) {
                                if (err) {
                                    return callback(err);
                                }

                                $rootScope.$broadcast('stream-online');
                                SocketIOServer.emit('stream-online', callback);
                            });
                        }
                    });
                },
                nowOffline: function (callback) {
                    this.isOnline(function (online) {
                        if (online) {
                            $rootScope.App.db.stream.insert({online: false, date: new Date()}, function (err) {
                                if (err) {
                                    return callback(err);
                                }

                                $rootScope.$broadcast('stream-offline');
                                SocketIOServer.emit('stream-offline', callback);
                            });
                        }
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
                }
            };
        }];
    });
})();