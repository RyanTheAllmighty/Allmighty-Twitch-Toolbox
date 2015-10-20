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
let async = require('async');
let remote = require('remote');
let Datastore = require('nedb');
let request = require('request');

var app = angular.module('AllmightyTwitchToolbox', [
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
    'datatables',
    'datatables.bootstrap',
    'followers',
    'donations',
    'luegg.directives',
    'LocalStorageModule'
]);

app.config(function ($routeProvider, localStorageServiceProvider, NotificationProvider, TwitchProvider, StreamTipProvider, SocketIOProvider, SocketIOServerProvider, FollowerCheckerProvider, DonationCheckerProvider) {
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


    localStorageServiceProvider.setPrefix('AllmightyTwitchToolbox');

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
        accessToken: remote.getCurrentWindow().App.settings.twitch.apiToken,
        clientID: remote.getCurrentWindow().App.settings.twitch.apiClientID
    });

    // Setup the StreamTipProvider
    StreamTipProvider.setOptions({
        clientId: remote.getCurrentWindow().App.settings.streamtip.clientID,
        accessToken: remote.getCurrentWindow().App.settings.streamtip.accessToken
    });

    // Setup the SocketIOServerProvider
    SocketIOServerProvider.setOptions({
        socketPort: remote.getCurrentWindow().App.settings.network.socketIOPort
    });

    // Start the SocketIO Server
    SocketIOServerProvider.startServer();

    // Setup the SocketIOProvider
    SocketIOProvider.setOptions({
        socketPort: remote.getCurrentWindow().App.settings.network.socketIOPort
    });

    // Setup the follower checker
    FollowerCheckerProvider.setOptions({
        interval: remote.getCurrentWindow().App.settings.checks.followers
    });

    // Setup the donation checker
    DonationCheckerProvider.setOptions({
        interval: remote.getCurrentWindow().App.settings.checks.donations
    });
});

app.run(['$rootScope', 'localStorageService', function ($rootScope, localStorageService) {
    // Load the app into the root scope
    $rootScope.App = remote.getCurrentWindow().App;

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

app.run(['FollowerChecker', 'DonationChecker', function (FollowerChecker, DonationChecker) {
    // Start checking for new followers
    FollowerChecker.startChecking();

    // Start checking for new donations
    DonationChecker.startChecking();
}]);