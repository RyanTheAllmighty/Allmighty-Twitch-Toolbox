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

    let objectSymbol = Symbol();

    class NotificationQueue {
        constructor() {
            this[objectSymbol] = {
                queue: [],
                resolving: false,
                interval: null
            };
        }

        get interval() {
            return this[objectSymbol].interval;
        }

        get resolving() {
            return this[objectSymbol].resolving;
        }

        get queue() {
            return this[objectSymbol].queue;
        }

        add(item) {
            this.queue.push(item);
        }

        startQueue() {
            let self = this;

            return new Promise(function (resolve, reject) {
                if (self.interval) {
                    return reject(new Error('Queue already started!'));
                }

                self[objectSymbol].interval = setInterval(function () {
                    if (!self.resolving && self.queue.length !== 0) {
                        self[objectSymbol].resolving = self.queue.shift();

                        self.resolving.resolve().then(function () {
                            self[objectSymbol].resolving = null;
                        }).catch(function (err) {
                            console.error(err);
                            self[objectSymbol].resolving = null;
                        });
                    }
                }, 1000);

                resolve();
            });
        }

        stopQueue() {
            let self = this;

            return new Promise(function (resolve, reject) {
                if (!self.interval) {
                    return reject(new Error('Queue not started!'));
                }

                clearInterval(self.interval);

                self[objectSymbol].interval = null;

                resolve();
            });
        }
    }

    module.exports = NotificationQueue;
})();