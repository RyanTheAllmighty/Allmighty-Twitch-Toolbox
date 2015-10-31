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
    let _ = require('lodash');
    let path = require('path');
    let async = require('async');
    let nwNotify = require('nw-notify');

    // Include our services module
    let services = require(path.join(process.cwd(), 'app.backend', 'services'));

    class QueueableNotification {
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

        resolve() {
            let self = this;

            return new Promise(function (resolve) {
                let nWClose = null;

                nwNotify.notify({
                    title: self.data.title,
                    text: self.data.message,
                    onShowFunc: function (obj) {
                        nWClose = obj.closeNotification;
                    },
                    onClickFunc: function (obj) {
                        nWClose = null; // Set this to null since we've already closed it
                        obj.closeNotification();
                    }
                });

                let toDo = self.generateActionFunctions();

                async.each(toDo, function (func, next) {
                    func(next);
                });

                setTimeout(function () {
                    function allDone() {
                        if (nWClose) {
                            nWClose();
                        }

                        return resolve();
                    }

                    if (self.data.onDone) {
                        async.each(self.data.onDone, function (func, next) {
                            func();
                            next();
                        }, allDone);
                    } else {
                        allDone();
                    }
                }, self.data.timeout || 5000);
            });
        }

        generateActionFunctions() {
            let toDo = [];

            if (this.data.onAction) {
                _.forEach(this.data.onAction, function (func) {
                    toDo.push(func);
                });
            }

            if (this.data.socketIO) {
                _.forEach(this.data.socketIO, function (data, key) {
                    if (data) {
                        toDo.push(function (next) {
                            services.socketIOEmit(key, data).then(next).catch(next);
                        });
                    } else {
                        toDo.push(function (next) {
                            services.socketIOEmit(key).then(next).catch(next);
                        });
                    }
                });
            }

            return toDo;
        }
    }

    module.exports = QueueableNotification;
})();