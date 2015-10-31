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

    let Datastore = require('./datastore');

    class Followers extends Datastore {
        constructor(options) {
            super('followers', options);
        }

        get(options) {
            let self = this;

            return new Promise(function (resolve, reject) {
                options.limit = parseInt(options.limit);
                options.offset = parseInt(options.offset);
                options.order = options.order.toLowerCase();

                if (options.limit < 1 || options.limit > 100) {
                    return reject(new Error('Invalid option for \'limit\' provided. Should be between 1 and 100 inclusive.'));
                }

                if (options.offset < 0) {
                    return reject(new Error('Invalid option for \'offset\' provided. Should be 0 or more.'));
                }

                if (options.order !== 'asc' && options.order !== 'desc') {
                    return reject(new Error('Invalid option for \'order\' provided. Should be \'asc\' or \'desc\'.'));
                }

                self.datastore.count({}, function (err, total) {
                    if (err) {
                        return reject(err);
                    }

                    if (options.offset >= total) {
                        return reject(new Error('Invalid option for \'offset\' provided. Offset is larger than the total.'));
                    }

                    self.datastore.find({}).sort({date: (options.order === 'asc' ? 1 : -1)}).skip(options.offset).limit(options.limit).exec(function (err, followers) {
                        if (err) {
                            return reject(err);
                        }

                        followers = _.map(followers, function (entry) {
                            return _.omit(entry, '_id');
                        });

                        return resolve({
                            _total: total,
                            _count: followers.length,
                            _offset: options.offset,
                            _limit: options.limit,
                            _order: options.order,
                            followers: followers
                        });
                    });
                });
            });
        }

        count() {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.datastore.count({}, function (err, total) {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(total);
                });
            });
        }

        getFollower(user) {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.datastore.findOne(isNaN(user) ? {username: user} : {id: parseInt(user)}).limit(1).exec(function (err, follow) {
                    if (err) {
                        return reject(err);
                    }

                    if (!follow) {
                        return reject(new Error('That user has never followed the channel before!'));
                    }

                    return resolve(_.omit(follow, '_id'));
                });
            });
        }
    }

    module.exports = Followers;
})();