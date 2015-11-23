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
    let tmijs = require('tmi.js');
    let express = require('express');
    let OBSRemote = require('obs-remote');
    let TwitchAPI = require('twitch-api');
    let bodyParser = require('body-parser');
    let GiantBombAPI = require('giantbombapi');
    let gui = global.window.nwDispatcher.requireNwGui();

    // Our Classes
    let Chat = require('./classes/chat');
    let Stream = require('./classes/stream');
    let Timers = require('./classes/timers');
    let Viewers = require('./classes/viewers');
    let Settings = require('./classes/settings');
    let Donations = require('./classes/donations');
    let Followers = require('./classes/followers');
    let OBSStatus = require('./classes/obsStatus');
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
        obsStatus: null,
        chat: null,
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
        obsRemote: null,
        twitchAPI: null,
        streamTipAPI: null,
        giantBombAPI: null,
        splashScreen: null,
        twitchChatClient: null,
        shortcuts: {
            muteMicrophone: null
        },
        tray: {
            main: null,
            menu: null,
            tools: {
                menu: null,
                submenu: null,
                microphone: null,
                microphoneWindow: null
            },
            exit: null
        },
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
                    module.exports.chat = new Chat({inMemoryOnly: true, autoload: true});
                    module.exports.obsStatus = new OBSStatus({inMemoryOnly: true, autoload: true});

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

                    // Setup the tray menu stuff to enable it all now that were loaded
                    module.exports.tray.exit.enabled = true;
                    module.exports.tray.tools.menu.enabled = true;
                });
            });
        },
        setupTrayIcon: function () {
            return new Promise(function (resolve) {
                module.exports.tray.main = new gui.Tray({title: 'Allmighty Twitch Toolbox', tooltip: 'Allmighty Twitch Toolbox', icon: 'assets/image/icon.png'});

                // Main Menu
                module.exports.tray.menu = new gui.Menu();
                module.exports.tray.exit = new gui.MenuItem({type: 'normal', label: 'Exit', enabled: false});
                module.exports.tray.exit.click = function () {
                    if (module.exports.tray.tools.microphoneWindow) {
                        module.exports.tray.tools.microphoneWindow.close();
                    }

                    gui.Window.get().close();
                };

                // Tools Menu
                module.exports.tray.tools.menu = new gui.MenuItem({type: 'normal', label: 'Tools', enabled: false});

                // Tools Submenu
                module.exports.tray.tools.submenu = new gui.Menu();
                module.exports.tray.tools.microphone = new gui.MenuItem({type: 'normal', label: 'Microphone Status'});
                module.exports.tray.tools.microphone.click = function () {
                    if (!module.exports.tray.tools.microphoneWindow) {
                        module.exports.tray.tools.microphoneWindow = gui.Window.open('http://localhost:28800/tools/microphone-status', {
                            frame: true,
                            toolbar: false,
                            show_in_taskbar: true,
                            show: false,
                            resizable: true
                        });

                        module.exports.tray.tools.microphoneWindow.on('closed', function () {
                            module.exports.tray.tools.microphoneWindow = null;
                        });

                        module.exports.tray.tools.microphoneWindow.on('move', function (x, y) {
                            module.exports.settings.get('tools', 'microphoneStatus').then(function (setting) {
                                setting.value.x = x;
                                setting.value.y = y;
                                module.exports.settings.set('tools', 'microphoneStatus', setting.value);
                            });
                        });

                        module.exports.tray.tools.microphoneWindow.on('resize', function (width, height) {
                            module.exports.settings.get('tools', 'microphoneStatus').then(function (setting) {
                                setting.value.width = width;
                                setting.value.height = height;
                                module.exports.settings.set('tools', 'microphoneStatus', setting.value);
                            });
                        });

                        module.exports.tray.tools.microphoneWindow.on('loaded', function () {
                            module.exports.settings.get('tools', 'microphoneStatus').then(function (setting) {
                                module.exports.tray.tools.microphoneWindow.moveTo(setting.value.x, setting.value.y);
                                module.exports.tray.tools.microphoneWindow.resizeTo(setting.value.width, setting.value.height);
                                module.exports.tray.tools.microphoneWindow.show();
                            }).catch(function (err) {
                                console.error(err);
                                module.exports.tray.tools.microphoneWindow = null;
                            });
                        });
                    }
                };
                module.exports.tray.tools.submenu.append(module.exports.tray.tools.microphone);

                // Set the submenu
                module.exports.tray.tools.menu.submenu = module.exports.tray.tools.submenu;

                // Add them to the menu
                module.exports.tray.menu.append(module.exports.tray.tools.menu);
                module.exports.tray.menu.append(new gui.MenuItem({type: 'separator'}));
                module.exports.tray.menu.append(module.exports.tray.exit);

                // Add the menu to the tray
                module.exports.tray.main.menu = module.exports.tray.menu;

                return resolve();
            });
        },
        setupOBSRemote: function () {
            return new Promise(function (resolve, reject) {
                module.exports.settings.get('obs', 'remotePassword').then(function (setting) {
                    module.exports.obsRemote = new OBSRemote();

                    if (setting.value) {
                        module.exports.obsRemote.connect('127.0.0.1', setting.value);
                    } else {
                        module.exports.obsRemote.connect('127.0.0.1');
                    }

                    module.exports.obsRemote.onStreamStarted = function (preview) {
                        module.exports.socketIOEmit('obs-stream-started', {preview});
                    };

                    module.exports.obsRemote.onStreamStopped = function (preview) {
                        module.exports.socketIOEmit('obs-stream-stopped', {preview});
                    };

                    module.exports.obsRemote.onSceneSwitched = function (name) {
                        global.services.obsRemote.getSceneList(function (currentScene, allScenes) {
                            module.exports.socketIOEmit('obs-scene-switched', _.findWhere(allScenes, {name}));
                        });
                    };

                    module.exports.obsRemote.onMicrophoneVolumeChanged = function (volume, muted, adjusting) {
                        if (!adjusting) {
                            module.exports.socketIOEmit('obs-microphone-volume-changed', {volume, muted});
                        }
                    };

                    module.exports.obsRemote.onDesktopVolumeChanged = function (volume, muted, adjusting) {
                        if (!adjusting) {
                            module.exports.socketIOEmit('obs-desktop-volume-changed', {volume, muted});
                        }
                    };

                    module.exports.obsRemote.onStatusUpdate = function (streaming, previewing, bytesPerSecond, strain, streamDurationInMS, totalFrames, droppedFrames, framesPerSecond) {
                        module.exports.obsStatus.process(streaming, previewing, bytesPerSecond, strain, streamDurationInMS, totalFrames, droppedFrames, framesPerSecond);
                    };

                    return resolve();
                }).catch(reject);
            });
        },
        setupGlobalKeyboardShortcuts: function () {
            return new Promise(function (resolve, reject) {
                module.exports.settings.get('obs', 'muteMicrophoneHotkey').then(function (setting) {
                    module.exports.shortcuts.muteMicrophone = new gui.Shortcut({
                        key: setting.value,
                        active: function () {
                            module.exports.obsRemote.getSceneList(function (currentScene, allScenes) {
                                let scene = _.findWhere(allScenes, {name: currentScene});

                                // Check to see if there is a [NOMUTE] in the name of the scene or as one of the source names
                                if (scene && currentScene.indexOf('[NOMUTE]') === -1 && !_.any(scene.sources, {name: '[NOMUTE]'})) {
                                    module.exports.obsRemote.toggleMicrophoneMute();
                                }
                            });
                        },
                        failed: function (msg) {
                            console.error(new Error(msg));
                        }
                    });

                    gui.App.registerGlobalHotKey(module.exports.shortcuts.muteMicrophone);

                    return resolve();
                }).catch(reject);
            });
        },
        setupTwitchChat: function () {
            return new Promise(function (resolve, reject) {
                module.exports.settings.get('twitch', 'auth').then(function (setting) {
                    if (setting.value.username && setting.value.accessToken) {
                        module.exports.twitchChatClient = new tmijs.client({
                            connection: {
                                random: 'chat',
                                reconnect: true
                            },
                            identity: {
                                username: setting.value.username,
                                password: 'oauth:' + setting.value.accessToken
                            },
                            channels: ['#' + setting.value.username]
                        });

                        module.exports.twitchChatClient.on('clearchat', function () {
                            module.exports.chat.parseClearChat();
                        });

                        module.exports.twitchChatClient.on('chat', function (channel, user, message, self) {
                            module.exports.chat.parseChat(user, message, self);
                        });

                        module.exports.twitchChatClient.on('action', function (channel, user, message, self) {
                            module.exports.chat.parseChat(user, message, self);
                        });

                        module.exports.twitchChatClient.on('notice', function (channel, msgid, message) {
                            module.exports.chat.parseNotice(msgid, message);
                        });

                        module.exports.twitchChatClient.on('timeout', function (channel, username) {
                            module.exports.chat.parseTimeout(username);
                        });

                        module.exports.twitchChatClient.on('hosted', function (channel, username, viewers) {
                            module.exports.chat.hosted(username, viewers);
                        });

                        module.exports.twitchChatClient.on('slowmode', function (channel, enabled, length) {
                            module.exports.chat.parseSlowmode(enabled, length);
                        });

                        module.exports.twitchChatClient.on('subscribers', function (channel, enabled) {
                            module.exports.chat.parseSubmode(enabled);
                        });

                        module.exports.twitchChatClient.on('roomstate', function (channel, state) {
                            module.exports.chat.parseState(state);
                        });

                        module.exports.twitchChatClient.on('emotesets', function (sets) {
                            module.exports.chat.loadTwitchEmotes(sets);
                        });
                    }

                    module.exports.chat.loadEmotes().then(resolve).catch(reject);
                }).catch(reject);
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
                    // Add this socket to the list of active sockets
                    module.exports.sockets.push(socket);

                    socket.once('angular-loaded', function () {
                        if (module.exports.splashScreen) {
                            // Close the splash screen
                            module.exports.splashScreen.close();

                            // Show the window
                            gui.Window.get().show();
                        }
                    });

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
                module.exports.expressApp.use('/tools/js', express.static(path.join(process.cwd(), 'app.tools', 'js')));
                module.exports.expressApp.use('/tools/css', express.static(path.join(process.cwd(), 'app.tools', 'css')));
                module.exports.expressApp.use('/overlays/js', express.static(path.join(process.cwd(), 'app.overlays', 'js')));
                module.exports.expressApp.use('/overlays/css', express.static(path.join(process.cwd(), 'app.overlays', 'css')));

                module.exports.expressApp.set('view engine', 'jade');

                module.exports.expressApp.use(bodyParser.json({limit: '50mb'}));

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

                module.exports.expressApp.use(['/scenes', '/overlays'], function (req, res, next) {
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
                module.exports.expressApp.use('/tools', require(path.join(process.cwd(), 'app.backend', 'routes', 'toolsRoutes')));
                module.exports.expressApp.use('/overlays', require(path.join(process.cwd(), 'app.backend', 'routes', 'overlaysRoutes')));

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
        connectToTwitchChat: function () {
            return new Promise(function (resolve, reject) {
                if (module.exports.twitchChatClient) {
                    console.log(module.exports.twitchChatClient);
                    module.exports.twitchChatClient.connect().then(resolve).catch(reject);
                } else {
                    return resolve();
                }
            });
        },
        loadAngularApp: function () {
            return new Promise(function (resolve) {
                window.location = 'http://localhost:' + 28800;

                return resolve();
            });
        }
    };
})();