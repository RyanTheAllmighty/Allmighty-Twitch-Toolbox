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

    class Timers extends Datastore {
        constructor(options) {
            super('timers', options);
        }

        get(id) {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.datastore.findOne({$or: [{_id: id}, {name: id}]}).exec(function (err, timer) {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(timer);
                });
            });
        }

        getAll() {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.datastore.find({}).exec(function (err, timers) {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(timers);
                });
            });
        }
    }

    module.exports = Timers;
})();