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

/* globals _ */

(function () {
    'use strict';

    angular.module('AllmightyTwitchToolbox').controller('SettingsController', settingsController);

    settingsController.$inject = ['$scope', '$timeout', 'Notification', 'Settings'];

    function settingsController($scope, $timeout, Notification, Settings) {
        $scope.settings = {};

        $scope.reset = function () {
            Settings.getAll().then(function (settings) {
                $timeout(function () {
                    _.forEach(settings, function (setting) {
                        if (!$scope.settings[setting.group]) {
                            $scope.settings[setting.group] = {};
                        }

                        if (!$scope.settings[setting.group][setting.name]) {
                            $scope.settings[setting.group][setting.name] = {};
                        }

                        $scope.settings[setting.group][setting.name] = setting.value;
                    });

                    $scope.$apply();
                });
            }).catch(function (err) {
                return Notification.error({message: err.message, delay: 3000});
            });
        };

        $scope.reset();

        $scope.loginToTwitch = function () {
            Settings.getTwitchLoginURL().then(function (url) {
                window.location.replace(url);
            }).catch(function (err) {
                return Notification.error({message: err.message, delay: 3000});
            });
        };

        $scope.save = function () {
            if (document.getElementById('channelHosted').files[0]) {
                $scope.settings.sounds.channelHosted = document.getElementById('channelHosted').files[0].path.toString();
            }

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

            let isNowSetup = false;

            if (!$scope.settings.application.hasSetup) {
                isNowSetup = true;
                $scope.settings.application.hasSetup = true;
            }

            Settings.setAll($scope.settings).then(function () {
                if (isNowSetup) {
                    Notification.success({message: 'Settings saved! Please restart the application!', delay: 3000});
                } else {
                    Notification.success({message: 'Settings saved!', delay: 3000});
                }
            }).catch(function (err) {
                return Notification.error({message: err.message, delay: 3000});
            });
        };
    }
})();