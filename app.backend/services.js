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
    let bodyParser = require('body-parser');
    let GiantBombAPI = require('giantbombapi');
    let gui = global.window.nwDispatcher.requireNwGui();

    // Our Classes
    let Stream = require('./classes/stream');
    let Timers = require('./classes/timers');
    let Viewers = require('./classes/viewers');
    let Settings = require('./classes/settings');
    let Donations = require('./classes/donations');
    let Followers = require('./classes/followers');
    let StreamTipAPI = require('./classes/streamTipAPI');
    let MusicChecker = require('./checkers/musicChecker');
    let StreamChecker = require('./checkers/streamChecker');
    let FollowerChecker = require('./checkers/followerChecker');
    let DonationChecker = require('./checkers/donationChecker');
    let NotificationQueue = require('./classes/notificationQueue');

    module.exports = {
        donations: null,
        followers: null,
        settings: null,
        stream: null,
        viewers: null,
        timers: null,
        expressApp: null,
        expressServer: null,
        io: null,
        sockets: [],
        notificationQueue: null,
        followerChecker: null,
        donationChecker: null,
        musicChecker: null,
        streamChecker: null,
        twitchAPI: null,
        streamTipAPI: null,
        giantBombAPI: null,
        splashScreen: null,
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
                module.exports.settings = new Settings({autoload: true});

                module.exports.settings.checkSettings().then(function () {
                    module.exports.stream = new Stream({autoload: true});
                    module.exports.timers = new Timers({autoload: true});
                    module.exports.viewers = new Viewers({autoload: true});
                    module.exports.donations = new Donations({autoload: true});
                    module.exports.followers = new Followers({autoload: true});

                    module.exports.notificationQueue = new NotificationQueue();

                    module.exports.followerChecker = new FollowerChecker();
                    module.exports.donationChecker = new DonationChecker();
                    module.exports.streamChecker = new StreamChecker();
                    module.exports.musicChecker = new MusicChecker();

                    module.exports.expressApp = express();
                    module.exports.expressServer = require('http').Server(module.exports.expressApp);

                    module.exports.io = require('socket.io')(module.exports.expressServer);

                    return resolve();
                }).catch(reject);
            });
        },
        showSplashScreen: function () {
            return new Promise(function (resolve) {
                module.exports.splashScreen = gui.Window.open('./splash-screen.html', {
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
                module.exports.splashScreen.on('loaded', function () {
                    module.exports.splashScreen.show();

                    return resolve();
                });

                // When the splash screen is closed, remove it from global
                module.exports.splashScreen.on('closed', function () {
                    module.exports.splashScreen = null;
                });
            });
        },
        setupTwitchAPI: function () {
            return new Promise(function (resolve, reject) {
                module.exports.settings.getGroup('twitch').then(function (settings) {
                    module.exports.twitchAPI = new TwitchAPI({
                        clientId: _.result(_.findWhere(settings, {name: 'clientID'}), 'value'),
                        redirectUri: encodeURIComponent(_.result(_.findWhere(settings, {name: 'redirectURI'}), 'value')),
                        scopes: _.result(_.findWhere(settings, {name: 'scopes'}), 'value')
                    });

                    return resolve();
                }).catch(reject);
            });
        },
        setupStreamTipAPI: function () {
            return new Promise(function (resolve, reject) {
                module.exports.settings.getGroup('streamtip').then(function (settings) {
                    module.exports.streamTipAPI = new StreamTipAPI({
                        clientId: _.result(_.findWhere(settings, {name: 'clientID'}), 'value'),
                        accessToken: _.result(_.findWhere(settings, {name: 'accessToken'}), 'value')
                    });

                    return resolve();
                }).catch(reject);
            });
        },
        setupGiantBombAPI: function () {
            return new Promise(function (resolve, reject) {
                module.exports.settings.get('giantbomb', 'apiKey').then(function (setting) {
                    module.exports.giantBombAPI = new GiantBombAPI(setting.value);

                    return resolve();
                }).catch(reject);
            });
        },
        startNotificationQueue: function () {
            return module.exports.notificationQueue.startQueue();
        },
        startFollowerChecker: function () {
            return module.exports.followerChecker.startChecking();
        },
        startDonationChecker: function () {
            return module.exports.donationChecker.startChecking();
        },
        startStreamChecker: function () {
            return module.exports.streamChecker.startChecking();
        },
        startMusicChecker: function () {
            return module.exports.musicChecker.startChecking();
        },
        setupSocketIOServer: function () {
            return new Promise(function (resolve) {
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
            });
        },
        setupExpress: function () {
            return new Promise(function (resolve) {
                module.exports.expressApp.use('/app', express.static(path.join(process.cwd(), 'app')));
                module.exports.expressApp.use('/assets', express.static(path.join(process.cwd(), 'assets')));
                module.exports.expressApp.use('/scenes/js', express.static(path.join(process.cwd(), 'app.scenes', 'js')));
                module.exports.expressApp.use('/scenes/css', express.static(path.join(process.cwd(), 'app.scenes', 'css')));

                module.exports.expressApp.set('view engine', 'jade');

                module.exports.expressApp.use(bodyParser.json());

                module.exports.expressApp.use(function (req, res, next) {
                    res.header('Access-Control-Allow-Origin', '*');
                    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

                    next();
                });

                module.exports.expressApp.use('/foobar/*', function (req, res, next) {
                    global.services.settings.get('network', 'foobarHttpControlPort').then(function (port) {
                        req.foobarPort = port.value;
                        next();
                    }).catch(function (err) {
                        res.status(500).send({error: err.message});
                    });
                });

                module.exports.expressApp.use('/scenes/*', function (req, res, next) {
                    global.services.settings.getGroup('notifications').then(function (settings) {
                        req.notificationSettings = settings;
                        next();
                    }).catch(function (err) {
                        res.status(500).send({error: err.message});
                    });
                });

                module.exports.expressApp.use('/', require(path.join(process.cwd(), 'app.backend', 'routes', 'appRoutes')));
                module.exports.expressApp.use('/api', require(path.join(process.cwd(), 'app.backend', 'routes', 'apiRoutes')));
                module.exports.expressApp.use('/foobar', require(path.join(process.cwd(), 'app.backend', 'routes', 'foobarRoutes')));
                module.exports.expressApp.use('/scenes', require(path.join(process.cwd(), 'app.backend', 'routes', 'scenesRoutes')));

                module.exports.expressApp.use(function (req, res) {
                    res.status(404).json({error: 'Page not found!'});
                });

                return resolve();
            });
        },
        startExpressServer: function () {
            return new Promise(function (resolve, reject) {
                module.exports.expressServer.listen(28800, function (err) {
                    if (err) {
                        return reject(err);
                    }

                    return resolve();
                });
            });
        },
        loadAngularApp: function () {
            return new Promise(function (resolve) {
                window.location = 'http://localhost:' + 28800;

                // Close the splash screen
                module.exports.splashScreen.close();

                // Show the window
                gui.Window.get().show();

                return resolve();
            });
        }
    };
})();