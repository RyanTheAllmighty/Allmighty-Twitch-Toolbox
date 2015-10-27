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

    let express = require('express');
    let request = require('request');

    angular.module('web-server', []);

    angular.module('web-server').provider('WebServer', function () {
        this.options = {
            port: 5000,
            socketIOPort: 4000,
            donationNotificationTime: 5,
            followerNotificationTime: 5
        };

        this.expressApp = null;

        this.setOptions = function (options) {
            if (!angular.isObject(options)) {
                throw new Error('Options should be an object!');
            }

            this.options = angular.extend({}, this.options, options);
        };

        this.setup = function () {
            let self = this;

            this.expressApp = express();
            this.expressApp.use(express.static('assets/static/'));

            this.expressApp.set('views', 'assets/static/views/');
            this.expressApp.set('view engine', 'jade');

            this.expressApp.get('/alerts', function (req, res) {
                res.render('alerts', {
                    data: {
                        donationNotificationTime: self.options.donationNotificationTime * 1000,
                        followerNotificationTime: self.options.followerNotificationTime * 1000,
                        port: self.options.socketIOPort
                    }
                });
            });

            this.expressApp.get('/nowplaying', function (req, res) {
                res.render('nowplaying', {
                    data: {
                        musicChangeNotificationTime: self.options.musicChangeNotificationTime * 1000,
                        port: self.options.socketIOPort
                    }
                });
            });

            this.expressApp.get('/foobar/:action', function (req, res) {
                switch (req.params.action) {
                    case 'stop':
                        request('http://127.0.0.1:' + self.options.foobarHttpControlPort + '/ajquery/?cmd=Stop&param3=NoResponse', function (error, response, body) {
                            res.writeHead(response.statusCode);
                            res.end(body);
                        });
                        break;
                    case 'play':
                        request('http://127.0.0.1:' + self.options.foobarHttpControlPort + '/ajquery/?cmd=Start&param3=NoResponse', function (error, response, body) {
                            res.writeHead(response.statusCode);
                            res.end(body);
                        });
                        break;
                    case 'pause':
                        request('http://127.0.0.1:' + self.options.foobarHttpControlPort + '/ajquery/?cmd=PlayOrPause&param3=NoResponse', function (error, response, body) {
                            res.writeHead(response.statusCode);
                            res.end(body);
                        });
                        break;
                    case 'previous':
                        request('http://127.0.0.1:' + self.options.foobarHttpControlPort + '/ajquery/?cmd=StartPrevious&param3=NoResponse', function (error, response, body) {
                            res.writeHead(response.statusCode);
                            res.end(body);
                        });
                        break;
                    case 'next':
                        request('http://127.0.0.1:' + self.options.foobarHttpControlPort + '/ajquery/?cmd=StartNext&param3=NoResponse', function (error, response, body) {
                            res.writeHead(response.statusCode);
                            res.end(body);
                        });
                        break;
                    case 'nextpause':
                        request('http://127.0.0.1:' + self.options.foobarHttpControlPort + '/ajquery/?cmd=StartNext&param3=NoResponse', function () {
                            request('http://127.0.0.1:' + self.options.foobarHttpControlPort + '/ajquery/?cmd=PlayOrPause&param3=NoResponse', function (error, response, body) {
                                res.writeHead(response.statusCode);
                                res.end(body);
                            });
                        });
                        break;
                    default:
                        res.writeHead(500);
                        res.end('Unknown Action!');
                        break;
                }
            });
        };

        this.$get = function () {
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