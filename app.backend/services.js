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
    let express = require('express');
    let TwitchAPI = require('twitch-api');
    let gui = global.window.nwDispatcher.requireNwGui();

    // Our Classes
    let Donations = require('./classes/donations');
    let Followers = require('./classes/followers');
    let Settings = require('./classes/settings');
    let NotificationQueue = require('./classes/notificationQueue');
    let FollowerChecker = require('./checkers/followerChecker');

    console.log(process.env.BROWSER);

    module.exports = {
        donations: null,
        followers: null,
        settings: null,
        expressApp: null,
        socketIOApp: null,
        io: null,
        sockets: [],
        notificationQueue: null,
        followerChecker: null,
        donationChecker: null,
        musicChecker: null,
        streamChecker: null,
        twitchAPI: null,
        socketIOEmit: function (name, message) {
            return new Promise(function (resolve, reject) {
                if (_.isUndefined(message)) {
                    message = null;
                }

                if (module.exports.sockets.length === 0) {
                    resolve();
                }

                async.each(module.exports.sockets, function (socket, next) {
                    socket.emit(name, message);
                    next();
                }, function (err) {
                    if (err) {
                        return reject(err);
                    }

                    return resolve();
                });
            });
        },
        load: function () {
            return new Promise(function (resolve, reject) {
                module.exports.donations = new Donations({autoload: true});
                module.exports.followers = new Followers({autoload: true});
                module.exports.settings = new Settings({autoload: true});

                module.exports.socketIOApp = require('http').createServer();
                module.exports.io = require('socket.io')(module.exports.socketIOApp);

                module.exports.expressApp = express();

                return resolve();
            });
        },
        showSplashScreen: function () {
            return new Promise(function (resolve) {
                global.splashScreen = gui.Window.open('./splash-screen.html', {
                    position: 'center',
                    width: 500,
                    height: 200,
                    frame: false,
                    toolbar: false,
                    show_in_taskbar: false,
                    show: false,
                    resizable: false
                });

                // Once the splash screen has loaded then we show the window. This prevents the window from showing a blank white window as it loads
                global.splashScreen.on('loaded', function () {
                    global.splashScreen.show();
                });

                // When the splash screen is closed, remove it from global
                global.splashScreen.on('closed', function () {
                    delete global.splashScreen;
                });

                return resolve();
            });
        },
        setupTwitchAPI: function () {
            return new Promise(function (resolve, reject) {
                module.exports.settings.getGroup('twitch').then(function (settings) {
                    module.exports.twitchAPI = new TwitchAPI({
                        clientId: _.result(_.findWhere(settings, {name: 'apiClientID'}), 'value'),
                        accessToken: _.result(_.findWhere(settings, {name: 'apiToken'}), 'value')
                    });

                    return resolve();
                }).catch(reject);
            });
        },
        startNotificationQueue: function () {
            module.exports.notificationQueue = new NotificationQueue();

            return module.exports.notificationQueue.startQueue();
        },
        startFollowerChecker: function () {
            module.exports.followerChecker = new FollowerChecker();

            return module.exports.followerChecker.startChecking();
        },
        startDonationChecker: function () {
            return new Promise(function (resolve, reject) {
                return resolve();
            });
        },
        startMusicChecker: function () {
            return new Promise(function (resolve, reject) {
                return resolve();
            });
        },
        startStreamChecker: function () {
            return new Promise(function (resolve, reject) {
                return resolve();
            });
        },
        startSocketIOServer: function () {
            return new Promise(function (resolve, reject) {
                module.exports.settings.get('network', 'socketIOPort').then(function (port) {
                    // Listen on our socket.io server
                    module.exports.socketIOApp.listen(port.value);

                    module.exports.io.on('connection', function (socket) {
                        // This signals to all connected sockets to reload their state (if available) useful
                        socket.emit('reload-state');

                        // Add this socket to the list of active sockets
                        module.exports.sockets.push(socket);

                        // This makes sure we don't try to send messages on the socket to disconnected clients
                        socket.on('disconnect', function () {
                            let index = module.exports.sockets.indexOf(socket);

                            if (index > -1) {
                                module.exports.sockets.splice(index, 1);
                            }
                        });
                    });

                    return resolve();
                }, reject);
            });
        },
        setupExpress: function () {
            return new Promise(function (resolve) {
                module.exports.expressApp.use('/assets', express.static(path.join(process.cwd(), 'assets')));

                module.exports.expressApp.set('views', process.cwd());
                module.exports.expressApp.set('view engine', 'jade');

                module.exports.expressApp.use('/', require(path.join(process.cwd(), 'app.backend', 'routes', 'appRoutes')));
                module.exports.expressApp.use('/api', require(path.join(process.cwd(), 'app.backend', 'routes', 'apiRoutes')));

                return resolve();
            });
        },
        startExpressServer: function () {
            return new Promise(function (resolve, reject) {
                module.exports.settings.get('network', 'webPort').then(function (port) {
                    module.exports.expressApp.listen(port.value, function (err) {
                        if (err) {
                            console.error(err);
                        }

                        window.location = 'http://localhost:' + port.value;

                        return resolve();
                    });
                }, reject);
            });
        },
        loadAngularApp: function () {
            return new Promise(function (resolve, reject) {
                module.exports.settings.get('network', 'webPort').then(function (port) {
                    window.location = 'http://localhost:' + port.value;

                    return resolve();
                }, reject);
            });
        }
    };
    console.log(module.exports.donations);
})();