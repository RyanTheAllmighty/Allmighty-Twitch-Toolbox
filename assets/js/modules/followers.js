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

angular.module('followers', []);

angular.module('followers').provider('Followers', function () {
    this.$get = ['$q', '$rootScope', 'SocketIOServer', function ($q, $rootScope, SocketIOServer) {
        return {
            getFollowers: function (limit, callback) {
                if (limit && !callback) {
                    callback = limit;
                    limit = 100;
                }

                global.App.db.followers.find({}).sort({date: 1}).limit(limit).exec(callback);
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
                global.App.db.followers.count({}).exec(callback);
            },
            newFollower: function (follower, callback) {
                if (!follower.date) {
                    follower.date = new Date();
                }

                function notify(err) {
                    if (err) {
                        return callback(err);
                    }

                    // Send a broadcast to listening scopes
                    $rootScope.$broadcast('follower', follower);

                    // Send a broadcast to listening socket clients
                    SocketIOServer.emit('follower', follower, callback);
                }

                if (!follower.test) {
                    global.App.db.followers.update({username: follower.username}, {username: follower.username, date: follower.date}, {upsert: true}, notify);
                } else {
                    notify();
                }
            }
        };
    }];
});