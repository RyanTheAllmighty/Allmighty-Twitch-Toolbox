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

'use strict';

let async = require('async');
let nwNotify = require('nw-notify');

module.exports = class QueueableNotification {
    constructor() {
        this.data = {};
    }

    title(data) {
        this.data.title = data;

        return this;
    }

    message(data) {
        this.data.message = data;

        return this;
    }

    timeout(data) {
        this.data.timeout = data;

        return this;
    }

    socketIO(name, data) {
        if (!this.data.socketIO) {
            this.data.socketIO = {};
        }

        if (!data) {
            data = null;
        }

        this.data.socketIO[name] = data;

        return this;
    }

    scope(name, data) {
        if (!this.data.scope) {
            this.data.scope = {};
        }

        if (!data) {
            data = null;
        }

        this.data.scope[name] = data;

        return this;
    }

    onAction(callback) {
        if (callback) {
            if (!this.data.onAction) {
                this.data.onAction = [];
            }

            this.data.onAction.push(callback);
        }

        return this;
    }

    onDone(callback) {
        if (callback) {
            if (!this.data.onDone) {
                this.data.onDone = [];
            }

            this.data.onDone.push(callback);
        }

        return this;
    }

    resolve($injector, done) {
        let self = this;

        let nWClose = null;

        nwNotify.notify({
            title: self.data.title,
            text: self.data.message,
            onShowFunc: function (obj) {
                nWClose = obj.closeNotification;

                if (self.data.onAction) {
                    async.each(self.data.onAction, function (func, next) {
                        func(next);
                    });
                }
            }
        });

        $injector.get('$timeout')(function () {
            function allDone() {
                if (nWClose) {
                    nWClose();
                }

                done();
            }

            if (self.data.onDone) {
                async.each(self.data.onDone, function (func, next) {
                    func(next);
                }, allDone);
            } else {
                allDone();
            }
        }, self.data.timeout || 5000);
    }
};