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

/* globals app */

'use strict';

let settingsService = require('./assets/js/services/settingsService');

app.controller('SettingsController', ['$scope', 'Notification', function ($scope, Notification) {
    $scope.settings = angular.copy($scope.App.settings);

    $scope.reset = function () {
        $scope.settings = angular.copy($scope.App.settings);
    };

    $scope.save = function () {
        if (document.getElementById('newDonation').files[0]) {
            $scope.settings.sounds.newDonation = document.getElementById('newDonation').files[0].path.toString();
        }

        if (document.getElementById('newFollower').files[0]) {
            $scope.settings.sounds.newFollower = document.getElementById('newFollower').files[0].path.toString();
        }

        if (document.getElementById('binaryDirectory').files[0]) {
            $scope.settings.directories.binary = document.getElementById('binaryDirectory').files[0].path.toString();
        }

        if (document.getElementById('dataDirectory').files[0]) {
            $scope.settings.directories.data = document.getElementById('dataDirectory').files[0].path.toString();
        }

        if (document.getElementById('musicDirectory').files[0]) {
            $scope.settings.directories.music = document.getElementById('musicDirectory').files[0].path.toString();
        }

        $scope.App.settings = angular.copy($scope.settings);

        settingsService.saveSettings(function (err) {
            if (err) {
                console.error(err);
                return Notification.error({message: 'Couldn\'t save settings!', delay: 3000});
            }

            Notification.success({message: 'Settings saved!', delay: 3000});
        });
    };
}]);