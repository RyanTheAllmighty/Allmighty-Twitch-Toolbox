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

        create(name, date) {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.get(name).then(function (t) {
                    return reject(new Error('A timer with that name already exists!'));
                }).catch(function () {
                    self.datastore.insert({name, date}).exec(function (err, timer) {
                        if (err) {
                            return reject(err);
                        }

                        global.services.socketIOEmit('timer-added', timer);

                        return resolve(timer);
                    });
                });
            });
        }

        remove(id) {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.get(id).then(function (timer) {
                    self.datastore.remove({_id: timer._id}, function (err) {
                        if (err) {
                            return reject(err);
                        }

                        global.services.socketIOEmit('timer-deleted', {name: timer.name, _id: timer._id});

                        return resolve(timer);
                    });
                }).catch(function (err) {
                    return reject(err);
                });
            });
        }

        get(id) {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.datastore.findOne({$or: [{_id: id}, {name: id}]}).exec(function (err, timer) {
                    if (err) {
                        return reject(err);
                    }

                    if (!timer) {
                        return reject(new Error('No timer exists with that ID or name!'));
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

        set(id, name, date) {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.get(id).then(function (timer) {
                    if (name !== timer.name) {
                        // Different name so check for duplicate name
                        self.get(name).then(function (otherTimer) {
                            if (otherTimer._id !== timer._id) {
                                return reject(new Error('A timer with that name already exists!'));
                            }

                            setTimer();
                        }).catch(function () {
                            setTimer();
                        });
                    } else {
                        setTimer();
                    }

                    function setTimer() {
                        self.datastore.update({_id: id}, {$set: {name, date}}, {upsert: false}, function (err) {
                            if (err) {
                                return reject(err);
                            }

                            let theSetTimer = {
                                _id: timer._id,
                                name,
                                date
                            };

                            global.services.socketIOEmit('timer-set', theSetTimer);

                            return resolve(theSetTimer);
                        });
                    }
                }).catch(function (err) {
                    return reject(err);
                });
            });
        }
    }

    module.exports = Timers;
})();