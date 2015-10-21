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

    angular.module('followers', []);

    angular.module('followers').provider('Followers', function () {
        this.$get = ['$q', '$rootScope', 'SocketIOServer', 'Notifications', function ($q, $rootScope, SocketIOServer, Notifications) {
            console.log('Followers::$get()');
            return {
                getFollowers: function (limit, callback) {
                    if (limit && !callback) {
                        callback = limit;
                        limit = 100;
                    }

                    $rootScope.App.db.followers.find({}).sort({date: 1}).limit(limit).exec(callback);
                },
                getFollowersPromise: function (limit) {
                    let self = this;

                    return $q(function (resolve, reject) {
                        self.getFollowers(limit, function (err, followers) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(followers);
                            }
                        });
                    });
                },
                getFollowerCount: function (callback) {
                    $rootScope.App.db.followers.count({}).exec(callback);
                },
                processFollower: function (follower, callback) {
                    let self = this;

                    if (!follower.date) {
                        follower.date = new Date();
                    }

                    $rootScope.App.db.followers.find({$or: [{id: follower.id}, {username: follower.username}]}).limit(1).exec(function (err, docs) {
                        if (err) {
                            return callback(err);
                        }

                        if (docs.length === 0) {
                            // New follower
                            self.newFollower(follower, callback);
                        } else if (!_.isEqual(follower, _.omit(docs[0], '_id'))) {
                            // The follower has different information in our DB than what Twitch says (refollow, username change) so update that
                            self.updateFollower(follower, callback);
                        }
                    });
                },
                newFollower: function (follower, callback) {
                    if (!follower.date) {
                        follower.date = new Date();
                    }

                    function notify(err) {
                        if (err) {
                            return callback(err);
                        }

                        // Send a desktop notification
                        Notifications.notify('New Follower!', follower.display_name + ' has just followed!', {
                            url: $rootScope.App.settings.sounds.newFollower,
                            volume: $rootScope.App.settings.sounds.newFollowerVolume
                        });

                        // Send a broadcast to listening scopes
                        $rootScope.$broadcast('new-follower', follower);
                        $rootScope.$broadcast('followers');

                        // Send a broadcast to listening socket clients
                        SocketIOServer.emit('new-follower', follower, function (err) {
                            if (err) {
                                return callback(err);
                            }

                            SocketIOServer.emit('followers', callback);
                        });
                    }

                    if (!follower.test) {
                        $rootScope.App.db.followers.update({$or: [{username: follower.username}, {id: follower.id}]}, follower, {upsert: true}, notify);
                    } else {
                        notify();
                    }
                },
                updateFollower: function (follower, callback) {
                    if (!follower.date) {
                        follower.date = new Date();
                    }

                    function notify(err) {
                        if (err) {
                            return callback(err);
                        }

                        // Send a broadcast to listening scopes
                        $rootScope.$broadcast('followers');

                        // Send a broadcast to listening socket clients
                        SocketIOServer.emit('followers', callback);
                    }

                    if (!follower.test) {
                        $rootScope.App.db.followers.update({username: follower.username}, follower, {upsert: true}, notify);
                    } else {
                        notify();
                    }
                }
            };
        }];
    });
})();