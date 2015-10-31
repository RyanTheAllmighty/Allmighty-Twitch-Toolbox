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
    let path = require('path');

    angular.module('followers', []);

    angular.module('followers').provider('Followers', function () {
        this.options = {
            notificationTime: 5
        };

        this.setOptions = function (options) {
            if (!angular.isObject(options)) {
                throw new Error('Options should be an object!');
            }

            this.options = angular.extend({}, this.options, options);
        };

        this.$get = ['$q', '$rootScope', 'SocketIOServer', 'NotificationQueue', function ($q, $rootScope, SocketIOServer, NotificationQueue) {
            let options = this.options;

            return {
                setOptions: function (opts) {
                    options = opts;
                },
                getFollowers: function (limit, callback) {
                    if (!limit) {
                        limit = -1;
                    } else if (!callback) {
                        callback = limit;
                        limit = 100;
                    }

                    $rootScope.App.db.followers.find({}).sort({date: -1}).limit(limit).exec(callback);
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
                processFollower: function (follower, options, callback) {
                    let self = this;

                    if (options && !callback) {
                        callback = options;
                        options = {};
                    }

                    if (!follower.date) {
                        follower.date = new Date();
                    }

                    $rootScope.App.db.followers.find({$or: [{id: follower.id}, {username: follower.username}]}).limit(1).exec(function (err, docs) {
                        if (err) {
                            return callback(err);
                        }

                        if (docs.length === 0) {
                            // New follower
                            self.newFollower(follower, options, callback);
                        } else if (!self.areEqual(follower, _.omit(docs[0], '_id'))) {
                            // The follower has different information in our DB than what Twitch says (refollow, username change) so update that
                            self.updateFollower(follower, callback);
                        } else {
                            callback(options.errorOnNonNew ? new Error('Non new follower') : null);
                        }
                    });
                },
                areEqual: function (follower1, follower2) {
                    return _.isEqual(follower1, follower2);
                },
                newFollower: function (follower, options, callback) {
                    if (!options && !callback) {
                        callback = function () {
                        };
                        options = {};
                    }

                    if (options && !callback) {
                        callback = options;
                        options = {};
                    }

                    if (!follower.date) {
                        follower.date = new Date();
                    }

                    function notify(err) {
                        if (err) {
                            return callback(err);
                        }

                        if (options.noNotification) {
                            return callback();
                        }

                        let noti = new QueueableNotification()
                            .title('New Follower!')
                            .message(follower.display_name + ' has just followed!')
                            .timeout(options.notificationTime * 1000)
                            .socketIO('new-follower', follower)
                            .socketIO('followers')
                            .onAction(function (next) {
                                let toPlay = new Howl({
                                    urls: [$rootScope.App.settings.sounds.newFollower],
                                    volume: $rootScope.App.settings.sounds.newFollowerVolume
                                });

                                toPlay.play();
                                next();
                            })
                            .onDone(callback);

                        services.notificationQueue.add(noti);
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