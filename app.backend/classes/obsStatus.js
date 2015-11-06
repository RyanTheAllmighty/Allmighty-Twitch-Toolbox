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

    let _ = require('lodash');

    let index = 1;

    class OBSStatus extends Datastore {
        constructor(options) {
            super('obsStatus', options);

            if (options.inMemoryOnly) {
                let self = this;

                setInterval(function () {
                    if (index >= 60) {
                        self.datastore.remove({index: {$lt: index - 60}}, {multi: true}, function () {
                            self.datastore.persistence.compactDatafile();
                        });
                    }
                }, 60000);
            }
        }

        process(streaming, previewing, bytesPerSecond, strain, streamDurationInMS, totalFrames, droppedFrames, framesPerSecond) {
            if (this.datastore) {
                this.datastore.insert({streaming, previewing, bytesPerSecond, strain, streamDurationInMS, totalFrames, droppedFrames, framesPerSecond, date: new Date(), index: index++});
            }
        }

        getLatest() {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.datastore.findOne().sort({date: -1}).exec(function (err, data) {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(_.omit(data, ['index', '_id']));
                });
            });
        }

        getAll() {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.datastore.find({}).sort({date: -1}).exec(function (err, data) {
                    if (err) {
                        return reject(err);
                    }

                    data = _.map(data, function (entry) {
                        return _.omit(entry, ['index', '_id']);
                    });

                    return resolve(data);
                });
            });
        }
    }

    module.exports = OBSStatus;
})();