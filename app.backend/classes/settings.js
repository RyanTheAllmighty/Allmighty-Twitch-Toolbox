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

    class Settings extends Datastore {
        constructor(options) {
            super('settings', options);
        }

        get(group, name) {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.datastore.findOne({$and: [{group}, {name}]}, function (err, doc) {
                    if (err) {
                        return reject(err);
                    }

                    if (!doc || !doc.value) {
                        return reject(new Error('No setting found!'));
                    }

                    return resolve(_.omit(doc, '_id'));
                });
            });
        }

        getAll() {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.datastore.find({}, function (err, docs) {
                    if (err) {
                        return reject(err);
                    }

                    docs = _.map(docs, function (entry) {
                        return _.omit(entry, '_id');
                    });

                    return resolve(docs);
                });
            });
        }

        getGroup(group) {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.datastore.find({group}, function (err, docs) {
                    if (err) {
                        return reject(err);
                    }

                    if (docs.length === 0) {
                        return reject(new Error('No settings found!'));
                    }

                    docs = _.map(docs, function (entry) {
                        return _.omit(entry, '_id');
                    });

                    return resolve(docs);
                });
            });
        }

        set(group, name, value) {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.datastore.update({group, name}, {$set: {value}}, {upsert: true}, function (err, numReplaced, newDoc) {
                    if (err) {
                        return reject(err);
                    }

                    if (numReplaced === 0 && !newDoc) {
                        return reject(new Error('Setting not saved!'));
                    }

                    return resolve();
                });
            });
        }
    }

    module.exports = Settings;
})();