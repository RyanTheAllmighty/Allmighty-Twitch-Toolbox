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

var path = require('path');
var gui = require('nw.gui');
var Datastore = require('nedb');
var loadingService = require('./assets/js/services/loadingService');

var app = angular.module('AllmightyTwitchToolbox', ['ngRoute', 'ngSanitize', 'ui-notification', 'twitch']);

/**
 *
 * @type {{basePath: (String), db: {settings: (Datastore)}, twitch: (TwitchService}}
 */
global.App = {
    // Setup the base path
    basePath: path.join(gui.App.dataPath, 'ApplicationStorage'),
    db: {
        settings: new Datastore({filename: path.join(gui.App.dataPath, 'ApplicationStorage', 'db', 'settings.db'), autoload: true})
    },
    settings: {},
    twitch: {}
};

gui.Window.get().on('closed', function () {
    gui.App.clearCache();
});

gui.Window.get().on('new-win-policy', function (frame, url, policy) {
    gui.Shell.openExternal(url);
    policy.ignore();
});

app.config(function ($routeProvider, NotificationProvider, TwitchProvider) {
    // Load everything before we proceed
    loadingService.load(function (err) {
        if (err) {
            console.error(err);
        }

        // Setup the routes
        $routeProvider.when('/', {
            templateUrl: './assets/html/home.html',
            controller: 'HomeController'
        }).when('/settings', {
            templateUrl: './assets/html/settings.html',
            controller: 'SettingsController'
        }).when('/tools', {
            templateUrl: './assets/html/tools.html',
            controller: 'ToolsController'
        }).when('/help', {
            templateUrl: './assets/html/help.html',
            controller: 'HelpController'
        }).otherwise({redirectTo: '/'});

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
            accessToken: '',
            clientID: ''
        });
    });
});

app.run(function () {
    // Show the window
    gui.Window.get().show();
});