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

    class Donations extends Datastore {
        constructor(options) {
            super('donations', options);
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

                    self.datastore.find({}).sort({date: (options.order === 'asc' ? 1 : -1)}).skip(options.offset).limit(options.limit).exec(function (err, donations) {
                        if (err) {
                            return reject(err);
                        }

                        donations = _.map(donations, function (entry) {
                            return _.omit(entry, '_id');
                        });

                        return resolve({
                            _total: total,
                            _count: donations.length,
                            _offset: options.offset,
                            _limit: options.limit,
                            _order: options.order,
                            donations: donations
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

        total() {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.datastore.find({}, function (err, donations) {
                    if (err) {
                        return reject(err);
                    }

                    if (donations.length === 0) {
                        return resolve(0);
                    }

                    return resolve(parseFloat(_.sum(donations, 'amount').toFixed(2)));
                });
            });
        }
    }

    module.exports = Donations;
})();