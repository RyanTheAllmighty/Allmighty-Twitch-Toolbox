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

    let async = require('async');

    angular.module('socket-io-server', []);

    // This is a list of all the sockets currently listening
    let sockets = [];

    // If the socket is listening
    let listening = false;

    angular.module('socket-io-server').provider('SocketIOServer', function () {
        this.options = {
            socketPort: 4000
        };

        this.setOptions = function (options) {
            if (!angular.isObject(options)) {
                throw new Error('Options should be an object!');
            }

            this.options = angular.extend({}, this.options, options);
        };

        this.$get = function () {
            let thisModule = this;

            return {
                emit: function (name, message, callback) {
                    if (!callback) {
                        if (message instanceof Function) {
                            callback = message;
                            message = null;
                        } else {
                            callback = function () {
                            };
                        }
                    }

                    if (!angular.isDefined(message)) {
                        message = null;
                    }

                    async.each(sockets, function (socket, next) {
                        socket.emit(name, message);
                        next();
                    }, callback);
                },
                startServer: function (callback) {
                    if (listening) {
                        return callback(new Error('SocketIO server has already been started!'));
                    }

                    var serverApp = require('http').createServer();
                    var io = require('socket.io')(serverApp);

                    listening = true;

                    // Listen on our socket.io server
                    serverApp.listen(thisModule.options.socketPort);

                    io.on('connection', function (socket) {
                        // This signals to all connected sockets to reload their state (if available) useful
                        socket.emit('reload-state');

                        // Add this socket to the list of active sockets
                        sockets.push(socket);

                        // This makes sure we don't try to send messages on the socket to disconnected clients
                        socket.on('disconnect', function () {
                            var index = sockets.indexOf(socket);
                            if (index > -1) {
                                sockets.splice(index, 1);
                            }
                        });
                    });

                    callback();
                }
            };
        };
    });
})();