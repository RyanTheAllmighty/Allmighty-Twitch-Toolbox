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

    // NodeJS Modules
    let async = require('async');

    let objectSymbol = Symbol();

    class DonationChecker {
        constructor() {
            this[objectSymbol] = {
                doingInitialCheck: false,
                interval: null
            };
        }

        get interval() {
            return this[objectSymbol].interval;
        }

        get doingInitialCheck() {
            return this[objectSymbol].doingInitialCheck;
        }

        doInitialCheck() {
            let self = this;

            this[objectSymbol].doingInitialCheck = true;

            return new Promise(function (resolve, reject) {
                let offset = 0;
                let added = 0;

                if (!global.services.streamTipAPI.clientID || !global.services.streamTipAPI.apiToken) {
                    return resolve();
                }

                async.doWhilst(
                    function (cb) {
                        added = 0;

                        global.services.streamTipAPI.getTips({limit: 100, offset}).then(function (tips) {
                            if (tips._count === 0) {
                                return cb();
                            }

                            async.each(tips.tips, function (tip, next) {
                                global.services.donations.process({
                                    date: new Date(tip.date),
                                    id: tip._id,
                                    username: tip.username,
                                    amount: parseFloat(tip.amount),
                                    note: tip.note
                                }, {noNotification: true, errorOnNonNew: true}).then(function () {
                                    added++;

                                    next();
                                }).catch(function (err) {
                                    if (err && err.message !== 'Non new donation') {
                                        return next(err);
                                    }

                                    next();
                                });
                            }, function (err) {
                                if (err) {
                                    return cb(err);
                                }

                                offset += 100;

                                cb();
                            });
                        }).catch(cb);
                    },
                    function () {
                        return added !== 0;
                    },
                    function (err) {
                        if (err) {
                            self[objectSymbol].doingInitialCheck = false;

                            return reject(err);
                        }

                        self[objectSymbol].doingInitialCheck = false;

                        return resolve();
                    }
                );
            });
        }

        startChecking() {
            let self = this;

            return new Promise(function (resolve, reject) {
                if (self.doingInitialCheck) {
                    return reject(new Error('Doing initial check! Please wait until done!'));
                }

                if (self.interval) {
                    return reject(new Error('Donation Checker already started!'));
                }

                self.doInitialCheck().then(function () {
                    global.services.settings.get('checks', 'donations').then(function (setting) {
                        // Save this interval so we can cancel it if we get another one later
                        self[objectSymbol].interval = setInterval(function () {
                            global.services.streamTipAPI.getTips({limit: 10}).then(function (tips) {
                                async.each(tips.tips, function (tip, next) {
                                    global.services.donations.process({
                                        date: new Date(tip.date),
                                        id: tip._id,
                                        username: tip.username,
                                        amount: parseFloat(tip.amount),
                                        note: tip.note
                                    }).then(function () {
                                        next();
                                    }).catch(next);
                                }, function (err) {
                                    if (err) {
                                        return console.error(err);
                                    }
                                });
                            }).catch(console.error);
                        }, setting.value * 1000);

                        return resolve();
                    }).catch(reject);
                }).catch(reject);
            });
        }

        stopChecking() {
            let self = this;

            return new Promise(function (resolve, reject) {
                if (!self.interval) {
                    return reject(new Error('Donation Checker not started!'));
                }

                clearInterval(self.interval);

                self[objectSymbol].interval = null;

                return resolve();
            });
        }
    }

    module.exports = DonationChecker;
})();