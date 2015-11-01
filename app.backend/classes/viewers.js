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

    let Datastore = require('./datastore');

    class Viewers extends Datastore {
        constructor(options) {
            super('viewers', options);
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

                    if (total === 0) {
                        return reject(new Error('There are no viewer records.'));
                    }

                    if (options.offset >= total) {
                        return reject(new Error('Invalid option for \'offset\' provided. Offset is larger than the total.'));
                    }

                    self.datastore.find({}).sort({date: (options.order === 'asc' ? 1 : -1)}).skip(options.offset).limit(options.limit).exec(function (err, docs) {
                        if (err) {
                            return reject(err);
                        }

                        return resolve(docs);
                    });
                });
            });
        }

        getTotalViewers() {
            let self = this;

            return new Promise(function (resolve, reject) {
                global.services.stream.isOnline().then(function (online) {
                    if (!online) {
                        return reject(new Error('The stream is offline!'));
                    }

                    self.datastore.findOne({}).sort({date: -1}).exec(function (err, viewers) {
                        if (err) {
                            return reject(err);
                        }

                        return resolve(viewers.count);
                    });
                }).catch(reject);
            });
        }

        addViewerCount(count) {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.getTotalViewers().then(function (oldCount) {
                    self.datastore.insert({count, date: new Date()}, function (err) {
                        if (err) {
                            return reject(err);
                        }

                        if (count !== oldCount) {
                            global.services.socketIOEmit('viewer-count-updated', count);
                        }

                        return resolve();
                    });
                }).catch(reject);
            });
        }
    }

    module.exports = Viewers;
})();