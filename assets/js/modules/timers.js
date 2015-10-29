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

    let moment = require('moment');

    angular.module('timers', []);

    angular.module('timers').provider('Timers', function () {
        this.$get = ['$q', '$rootScope', 'SocketIOServer', function ($q, $rootScope, SocketIOServer) {
            return {
                getTimers: function (callback) {
                    $rootScope.App.db.timers.find({}).sort({date: -1}).exec(callback);
                },
                getTimer: function (id, callback) {
                    $rootScope.App.db.timers.find({$or: [{_id: id}, {name: id}]}).limit(1).exec(function (err, docs) {
                        if (err) {
                            return callback(err);
                        }

                        if (docs.length === 0) {
                            return callback(new Error('No timer found with that ID/Name!'));
                        }

                        callback(null, docs[0]);
                    });
                },
                addTimer: function (name, date, callback) {
                    $rootScope.App.db.timers.find({name: name}).limit(1).exec(function (err, docs) {
                        if (err) {
                            return callback(err);
                        }

                        if (docs.length !== 0) {
                            return callback(new Error('A timer already exists with that name!'));
                        }

                        $rootScope.App.db.timers.insert({name, date: date.toDate()}, function (err, newDoc) {
                            if (err) {
                                return callback(err);
                            }

                            SocketIOServer.emit('timer-added', newDoc, callback);
                        });
                    });
                },
                deleteTimer: function (id, callback) {
                    $rootScope.App.db.timers.remove({_id: id}, {}, function (err) {
                        if (err) {
                            return callback(err);
                        }

                        SocketIOServer.emit('timer-deleted', {
                            id
                        }, callback);
                    });
                },
                setTimer: function (id, name, date, callback) {
                    let self = this;

                    $rootScope.App.db.timers.find({$and: [{name: name}, {$not: {_id: id}}]}).limit(1).exec(function (err, docs) {
                        if (err) {
                            return callback(err);
                        }

                        if (docs.length !== 0) {
                            return callback(new Error('A timer already exists with that name!'));
                        }

                        $rootScope.App.db.timers.update({_id: id}, {name, date: date.toDate()}, {upsert: false}, function (err) {
                            if (err) {
                                return callback(err);
                            }

                            self.getTimer(id, function (err, timer) {
                                if (err) {
                                    return callback(err);
                                }

                                SocketIOServer.emit('timer-set', timer, callback);
                            });
                        });
                    });
                },
                addToTimer: function (id, seconds, callback) {
                    let self = this;

                    $rootScope.App.db.timers.find({_id: id}).limit(1).exec(function (err, docs) {
                        if (err) {
                            return callback(err);
                        }

                        if (docs.length === 0) {
                            return callback(new Error('No timer exists with that ID!'));
                        }

                        $rootScope.App.db.timers.update({_id: id}, {$set: {date: moment(docs[0].date).add(seconds, 'seconds').toDate()}}, {upsert: false}, function (err) {
                            if (err) {
                                return callback(err);
                            }

                            self.getTimer(id, function (err, timer) {
                                if (err) {
                                    return callback(err);
                                }

                                SocketIOServer.emit('timer-set', timer, callback);
                            });
                        });
                    });
                },
                removeFromTimer: function (id, seconds, callback) {
                    let self = this;

                    $rootScope.App.db.timers.find({_id: id}).limit(1).exec(function (err, docs) {
                        if (err) {
                            return callback(err);
                        }

                        if (docs.length === 0) {
                            return callback(new Error('No timer exists with that ID!'));
                        }

                        $rootScope.App.db.timers.update({_id: id}, {$set: {date: moment(docs[0].date).subtract(seconds, 'seconds').toDate()}}, {upsert: false}, function (err) {
                            if (err) {
                                return callback(err);
                            }

                            self.getTimer(id, function (err, timer) {
                                if (err) {
                                    return callback(err);
                                }

                                SocketIOServer.emit('timer-set', timer, callback);
                            });
                        });
                    });
                }
            };
        }];
    });
})();