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
                processInfo: function (channelInfo, streamInfo, callback) {
                    let self = this;

                    let statusData = {
                        followers: channelInfo.followers,
                        views: channelInfo.views,
                        game: channelInfo.game,
                        status: channelInfo.status,
                        online: streamInfo.stream !== null
                    };

                    this.getLastStatus(function (err, status) {
                        if (err || !_.isEqual(statusData, status)) {
                            $rootScope.App.db.stream.insert(statusData, function (err) {
                                if (err) {
                                    return callback(err);
                                }

                                if (status && statusData.followers !== status.followers) {
                                    $rootScope.$broadcast('followers-count-changed', statusData.followers);
                                    SocketIOServer.emit('followers-count-changed', statusData.followers);
                                }

                                if (status && statusData.views !== status.views) {
                                    $rootScope.$broadcast('views-count-changed', statusData.views);
                                    SocketIOServer.emit('views-count-changed', statusData.views);
                                }

                                if (statusData.online) {
                                    self.isOnline(function (online) {
                                        if (!online) {
                                            $rootScope.$broadcast('stream-online', statusData);
                                            SocketIOServer.emit('stream-online', statusData);
                                        }

                                        callback();
                                    });
                                } else {
                                    self.isOnline(function (online) {
                                        if (online) {
                                            $rootScope.$broadcast('stream-offline', statusData);
                                            SocketIOServer.emit('stream-offline', statusData);
                                        }

                                        callback();
                                    });
                                }
                            });
                        } else {
                            callback();
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
                },
                getLastStatus: function (callback) {
                    $rootScope.App.db.stream.find({}).sort({date: -1}).limit(1).exec(function (err, docs) {
                        if (err) {
                            return callback(err);
                        }

                        if (docs.length === 0) {
                            return callback(new Error('Never been online!'));
                        }

                        callback(null, _.omit(docs[0], ['_id']));
                    });
                }
            };
        }];
    });
})();