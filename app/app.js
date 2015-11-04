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

    let gui = require('nw.gui');

    let app = angular.module('AllmightyTwitchToolbox', [
        'ngSanitize',
        'ui-notification',
        'ui.bootstrap',
        'ui.router',
        'datatables',
        'datatables.bootstrap',
        'followers',
        'donations',
        'luegg.directives',
        'LocalStorageModule',
        'timers',
        'angularMoment',
        'viewers',
        'nvd3',
        'stream',
        'giantbomb',
        'settings',
        'btford.socket-io',
        'socketioapp'
    ]);

    app.config(function ($stateProvider, $urlRouterProvider, localStorageServiceProvider, NotificationProvider) {
        // Setup the routes
        $stateProvider.state('dashboard', {
            url: '/dashboard',
            templateUrl: 'app/views/dashboard.html',
            controller: 'DashboardController',
            controllerAs: 'vm'
        }).state('viewers', {
            url: '/viewers',
            templateUrl: 'app/views/viewers.html',
            controller: 'ViewersController',
            controllerAs: 'vm'
        }).state('followers', {
            url: '/followers',
            templateUrl: 'app/views/followers.html',
            controller: 'FollowersController',
            controllerAs: 'vm'
        }).state('donations', {
            url: '/donations',
            templateUrl: 'app/views/donations.html',
            controller: 'DonationsController',
            controllerAs: 'vm'
        }).state('timers', {
            url: '/timers',
            templateUrl: 'app/views/timers.html',
            controller: 'TimersController',
            controllerAs: 'vm'
        }).state('tools', {
            url: '/tools',
            templateUrl: 'app/views/tools.html',
            controller: 'ToolsController',
            controllerAs: 'vm'
        }).state('test', {
            url: '/test',
            templateUrl: 'app/views/test.html',
            controller: 'TestController',
            controllerAs: 'vm'
        }).state('settings', {
            url: '/settings',
            templateUrl: 'app/views/settings.html',
            controller: 'SettingsController',
            controllerAs: 'vm'
        }).state('help', {
            url: '/help',
            templateUrl: 'app/views/help.html',
            controller: 'HelpController',
            controllerAs: 'vm'
        });

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
    });

    app.run(['$rootScope', 'localStorageService', function ($rootScope, localStorageService) {
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

    app.run(['$state', function ($state) {
        // Close the splash screen
        global.splashScreen.close();

        // Go to the dashboard
        $state.go('dashboard');

        // Show the window
        gui.Window.get().show();
    }]);
})();