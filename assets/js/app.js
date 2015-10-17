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

let _ = require('lodash');
let path = require('path');
let gui = require('nw.gui');
let async = require('async');
let Datastore = require('nedb');
let request = require('request');
let nwNotify = require('nw-notify');
let loadingService = require('./assets/js/services/loadingService');

var app = angular.module('AllmightyTwitchToolbox', [
    'ngRoute',
    'ngSanitize',
    'ui-notification',
    'twitch',
    'streamtip',
    'socket-io',
    'socket-io-server',
    'follower-checker',
    'donation-checker',
    'datatables',
    'datatables.bootstrap',
    'followers',
    'donations'
]);

/**
 *
 * @type {{basePath: (String), db: {settings: (Datastore)}}
 */
global.App = {
    // Setup the base path
    basePath: path.join(gui.App.dataPath, 'ApplicationStorage'),
    db: {
        donations: new Datastore({filename: path.join(gui.App.dataPath, 'ApplicationStorage', 'db', 'donations.db'), autoload: true}),
        followers: new Datastore({filename: path.join(gui.App.dataPath, 'ApplicationStorage', 'db', 'followers.db'), autoload: true}),
        settings: new Datastore({filename: path.join(gui.App.dataPath, 'ApplicationStorage', 'db', 'settings.db'), autoload: true})
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

app.config(function ($routeProvider, NotificationProvider, TwitchProvider, StreamTipProvider, SocketIOProvider, SocketIOServerProvider, FollowerCheckerProvider, DonationCheckerProvider) {
    // Load everything before we proceed
    loadingService.load(function (err) {
        if (err) {
            console.error(err);
        }

        // Setup the routes
        $routeProvider.when('/', {
            templateUrl: './assets/html/home.html',
            controller: 'HomeController'
        }).when('/followers', {
            templateUrl: './assets/html/followers.html',
            controller: 'FollowersController'
        }).when('/donations', {
            templateUrl: './assets/html/donations.html',
            controller: 'DonationsController'
        }).when('/settings', {
            templateUrl: './assets/html/settings.html',
            controller: 'SettingsController'
        }).when('/tools', {
            templateUrl: './assets/html/tools.html',
            controller: 'ToolsController'
        }).when('/test', {
            templateUrl: './assets/html/test.html',
            controller: 'TestController'
        }).when('/help', {
            templateUrl: './assets/html/help.html',
            controller: 'HelpController'
        }).otherwise({redirectTo: '/'});

        // Setup the notifications
        nwNotify.setTemplatePath('notification.html');
        nwNotify.setConfig({
            appIcon: 'assets/image/icon.png',
            displayTime: global.App.settings.notifications.notificationTime * 1000,
            maxVisibleNotifications: 1
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

        // Setup the follower checker
        FollowerCheckerProvider.setOptions({
            interval: global.App.settings.checks.followers
        });

        // Setup the donation checker
        DonationCheckerProvider.setOptions({
            interval: global.App.settings.checks.donations
        });
    });
});

app.run(['FollowerChecker', 'DonationChecker', function (FollowerChecker, DonationChecker) {
    // Start checking for new followers
    FollowerChecker.startChecking();

    // Start checking for new donations
    DonationChecker.startChecking();

    // Show the window
    gui.Window.get().show();
}]);