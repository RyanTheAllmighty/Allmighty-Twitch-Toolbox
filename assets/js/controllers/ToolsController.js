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

    let musicInformationParser = require('./assets/js/tools/musicInformationParser');

    angular.module('AllmightyTwitchToolbox').controller('ToolsController', ['$scope', '$timeout', function ($scope, $timeout) {
        $scope.log = {
            musicInformationParsing: ''
        };

        $scope.running = {
            musicInformationParsing: false
        };

        $scope.runMusicInformationParsing = function () {
            if (!$scope.running.musicInformationParsing) {
                $scope.log.musicInformationParsing = '';
                $scope.running.musicInformationParsing = true;

                let ee = musicInformationParser.run({
                    clientID: $scope.App.settings.soundcloud.clientID,
                    ffmpegPath: $scope.App.settings.directories.binary + '/ffmpeg.exe',
                    path: $scope.App.settings.directories.music
                });

                ee.on('info', function (message) {
                    $timeout(function () {
                        $scope.log.musicInformationParsing += message;
                        $scope.$apply();
                    });
                });

                ee.on('error', function (err) {
                    $timeout(function () {
                        $scope.log.musicInformationParsing += '\nError: ' + err.message;
                        $scope.$apply();
                    });

                    $scope.running.musicInformationParsing = false;
                });

                ee.on('done', function () {
                    $timeout(function () {
                        $scope.log.musicInformationParsing += '\nDone';
                        $scope.$apply();
                    });

                    $scope.running.musicInformationParsing = false;
                });
            }
        };
    }]);
})();