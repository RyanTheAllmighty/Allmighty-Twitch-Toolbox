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

    let path = require('path');
    let gui = require('nw.gui');
    let Datastore = require('nedb');
    let nwNotify = require('nw-notify');

    let loadingService = require('./assets/js/services/loadingService');

    /**
     * @type {{basePath: (String), db: {donations: (Datastore), followers: (Datastore), settings: (Datastore), timers: (Datastore)}, settings: (Object)}}
     */
    global.App = {
        // Setup the base path
        basePath: path.join(gui.App.dataPath, 'ApplicationStorage'),
        db: {
            donations: new Datastore({filename: path.join(gui.App.dataPath, 'ApplicationStorage', 'db', 'donations.db'), autoload: true}),
            followers: new Datastore({filename: path.join(gui.App.dataPath, 'ApplicationStorage', 'db', 'followers.db'), autoload: true}),
            settings: new Datastore({filename: path.join(gui.App.dataPath, 'ApplicationStorage', 'db', 'settings.db'), autoload: true}),
            stream: new Datastore({filename: path.join(gui.App.dataPath, 'ApplicationStorage', 'db', 'stream.db'), autoload: true}),
            timers: new Datastore({filename: path.join(gui.App.dataPath, 'ApplicationStorage', 'db', 'timers.db'), autoload: true}),
            viewers: new Datastore({filename: path.join(gui.App.dataPath, 'ApplicationStorage', 'db', 'viewers.db'), autoload: true})
        },
        settings: {}
    };

    gui.Window.get().on('closed', function () {
        gui.App.clearCache();
        nwNotify.closeAll();
    });

    gui.Window.get().on('new-win-policy', function (frame, url, policy) {
        gui.Shell.openExternal(url);
        policy.ignore();
    });

    let app = angular.module('AllmightyTwitchToolbox', [
        'ngRoute',
        'ngSanitize',
        'ui-notification',
        'ui.bootstrap',
        'twitch',
        'streamtip',
        'socket-io',
        'socket-io-server',
        'follower-checker',
        'donation-checker',
        'music-checker',
        'datatables',
        'datatables.bootstrap',
        'followers',
        'donations',
        'notification-queue',
        'luegg.directives',
        'LocalStorageModule',
        'web-server',
        'timers',
        'angularMoment',
        'viewers',
        'nvd3',
        'stream',
        'stream-checker'
    ]);

    // Load everything before we proceed
    loadingService.load(function () {
        app.config(function ($routeProvider, localStorageServiceProvider, WebServerProvider, NotificationProvider, TwitchProvider, StreamTipProvider, SocketIOProvider, SocketIOServerProvider, StreamCheckerProvider, FollowersProvider, FollowerCheckerProvider, DonationsProvider, DonationCheckerProvider, MusicCheckerProvider) {
            // Setup the routes
            $routeProvider.when('/dashboard', {
                templateUrl: './assets/html/dashboard.html',
                controller: 'DashboardController'
            }).when('/viewers', {
                templateUrl: './assets/html/viewers.html',
                controller: 'ViewersController'
            }).when('/followers', {
                templateUrl: './assets/html/followers.html',
                controller: 'FollowersController'
            }).when('/donations', {
                templateUrl: './assets/html/donations.html',
                controller: 'DonationsController'
            }).when('/timers', {
                templateUrl: './assets/html/timers.html',
                controller: 'TimersController'
            }).when('/tools', {
                templateUrl: './assets/html/tools.html',
                controller: 'ToolsController'
            }).when('/test', {
                templateUrl: './assets/html/test.html',
                controller: 'TestController'
            }).when('/settings', {
                templateUrl: './assets/html/settings.html',
                controller: 'SettingsController'
            }).when('/help', {
                templateUrl: './assets/html/help.html',
                controller: 'HelpController'
            }).otherwise({redirectTo: '/dashboard'});

            localStorageServiceProvider.setPrefix('AllmightyTwitchToolbox');

            nwNotify.setTemplatePath('notification.html');
            nwNotify.setConfig({
                appIcon: 'assets/image/icon.png'
            });

            WebServerProvider.setOptions({
                port: global.App.settings.network.webPort,
                socketIOPort: global.App.settings.network.socketIOPort,
                donationNotificationTime: global.App.settings.notifications.donationNotificationTime,
                followerNotificationTime: global.App.settings.notifications.followerNotificationTime,
                musicChangeNotificationTime: global.App.settings.notifications.musicChangeNotificationTime,
                foobarHttpControlPort: global.App.settings.network.foobarHttpControlPort
            });

            // Setup the NotificationProvider
            NotificationProvider.setOptions({
                delay: 10000,
                startTop: 20,
                startRight: 10,
                verticalSpacing: 20,
                horizontalSpacing: 20,
                positionX: 'right',
                positionY: 'top'
            });

            // Setup the TwitchProvider
            TwitchProvider.setOptions({
                accessToken: global.App.settings.twitch.apiToken,
                clientID: global.App.settings.twitch.apiClientID
            });

            // Setup the StreamTipProvider
            StreamTipProvider.setOptions({
                clientId: global.App.settings.streamtip.clientID,
                accessToken: global.App.settings.streamtip.accessToken
            });

            // Setup the SocketIOServerProvider
            SocketIOServerProvider.setOptions({
                socketPort: global.App.settings.network.socketIOPort
            });

            // Start the SocketIO Server
            SocketIOServerProvider.startServer();

            // Setup the SocketIOProvider
            SocketIOProvider.setOptions({
                socketPort: global.App.settings.network.socketIOPort
            });

            // Setup the stream checker
            StreamCheckerProvider.setOptions({
                interval: global.App.settings.checks.stream
            });

            // Setup the follower provider
            FollowersProvider.setOptions({
                notificationTime: global.App.settings.notifications.followerNotificationTime
            });

            // Setup the follower checker
            FollowerCheckerProvider.setOptions({
                interval: global.App.settings.checks.followers
            });

            // Setup the donation provider
            DonationsProvider.setOptions({
                notificationTime: global.App.settings.notifications.donationNotificationTime
            });

            // Setup the donation checker
            DonationCheckerProvider.setOptions({
                interval: global.App.settings.checks.donations
            });

            MusicCheckerProvider.setOptions({
                nowPlayingPath: path.join(global.App.settings.directories.data, 'NowPlayingPath.txt'),
                ffmpegPath: path.join(global.App.settings.directories.binary, 'ffmpeg.exe'),
                songInfoTxtPath: path.join(global.App.settings.directories.data, 'SongInfo.txt'),
                songInfoJsonPath: path.join(global.App.settings.directories.data, 'SongInfo.json')
            });
        });

        app.run(['$rootScope', 'localStorageService', function ($rootScope, localStorageService) {
            // Load the app into the root scope
            $rootScope.App = global.App;

            $rootScope._updateCollapse = function (model) {
                let parts = model.split('.').splice(1);

                if (!$rootScope._collapsedPanels[parts[0]]) {
                    $rootScope._collapsedPanels[parts[0]] = {};
                }

                $rootScope._collapsedPanels[parts[0]][parts[1]] = !$rootScope._collapsedPanels[parts[0]][parts[1]];

                localStorageService.set('collapsedPanels', $rootScope._collapsedPanels);
            };

            $rootScope._collapsedPanels = localStorageService.get('collapsedPanels');

            if (!$rootScope._collapsedPanels) {
                $rootScope._collapsedPanels = {};
            }
        }]);

        app.run(['FollowerChecker', 'DonationChecker', 'StreamChecker', 'MusicChecker', 'WebServer', 'NotificationQueue', function (FollowerChecker, DonationChecker, StreamChecker, MusicChecker, WebServer, NotificationQueue) {
            // Start checking for new followers
            FollowerChecker.startChecking();

            // Start checking for new donations
            DonationChecker.startChecking();

            // Start checking for stream stuffs
            StreamChecker.startChecking();

            // Start checking for song changes
            MusicChecker.startChecking();

            // Start the web server
            WebServer.startServer();

            // Start the notification queue
            NotificationQueue.startQueue();

            // Show the window
            gui.Window.get().show();
        }]);
    });
})();