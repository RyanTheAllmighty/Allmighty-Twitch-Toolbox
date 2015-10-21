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

    let fs = require('fs');
    let path = require('path');
    let express = require('express');

    angular.module('web-server', []);

    angular.module('web-server').provider('WebServer', function () {
        this.options = {
            port: 5000
        };

        this.expressApp = null;

        this.setOptions = function (options) {
            console.log('WebServerProvider::setOptions()');
            if (!angular.isObject(options)) {
                throw new Error('Options should be an object!');
            }

            this.options = angular.extend({}, this.options, options);
        };

        this.setup = function () {
            this.expressApp = express();
            this.expressApp.use(express.static('assets/static/'));

            this.expressApp.get('/nowplaying', function (req, res) {
                res.sendFile('nowplaying.html', {
                    root: 'assets/static/html/'
                });
            });
        };

        this.$get = function () {
            console.log('WebServer::$get()');
            let self = this;

            return {
                setOptions: function (options) {
                    self.setOptions(options);
                    self.startChecking();
                },
                startServer: function () {
                    if (!self.expressApp) {
                        self.setup();
                    }

                    self.expressApp.listen(self.options.port);
                }
            };
        };
    });
})();