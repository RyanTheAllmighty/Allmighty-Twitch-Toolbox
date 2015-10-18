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

angular.module('socket-io', []);

let clientSocketIO;

angular.module('socket-io').provider('SocketIO', function () {
    this.options = {
        socketPort: 4000
    };

    this.setOptions = function (options) {
        console.log('SocketIOProvider::setOptions()');
        if (!angular.isObject(options)) {
            throw new Error('Options should be an object!');
        }

        this.options = angular.extend({}, this.options, options);
    };

    this.$get = function () {
        console.log('SocketIO::$get()');
        if (!clientSocketIO) {
            console.log('New SocketIO Client');
            clientSocketIO = require('socket.io-client')('http://127.0.0.1:' + this.options.socketPort);

            clientSocketIO.on('disconnect', function () {
                clientSocketIO = undefined;
            });
        }

        return clientSocketIO;
    };
});