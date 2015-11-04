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

    let request = require('request');
    let musicInformationParser = require('./assets/js/tools/musicInformationParser');

    angular.module('AllmightyTwitchToolbox').controller('ToolsController', toolsController);

    toolsController.$inject = ['$scope', '$timeout'];

    function toolsController($scope, $timeout) {
        $scope.log = {
            musicInformationParsing: ''
        };

        $scope.running = {
            musicInformationParsing: false
        };

        $scope.nowPlaying = {
            isPlaying: false,
            artist: 'Unknown',
            title: 'Unknown',
            artwork: null
        };

        $scope.$on('song-changed', function (event, info) {
            $scope.nowPlaying.isPlaying = true;
            $scope.nowPlaying.artist = info.artist;
            $scope.nowPlaying.title = info.title;
            $scope.nowPlaying.artwork = info.artwork;
        });

        updateNowPlaying();

        $scope.previousSong = function () {
            request.get('http://localhost:28800/foobar/previous/', function () {
                $timeout(updateNowPlaying, 300);
            });
        };

        $scope.stopSong = function () {
            request.get('http://localhost:28800/foobar/stop/', function () {
                $timeout(updateNowPlaying, 300);
            });
        };

        $scope.playPauseSong = function () {
            request.get('http://localhost:28800/foobar/pause/', function () {
                $timeout(updateNowPlaying, 300);
            });
        };

        $scope.nextSong = function () {
            request.get('http://localhost:28800/foobar/next/', function () {
                $timeout(updateNowPlaying, 300);
            });
        };

        $scope.runMusicInformationParsing = function (force) {
            if (!$scope.running.musicInformationParsing) {
                $scope.log.musicInformationParsing = '';
                $scope.running.musicInformationParsing = true;

                let ee = musicInformationParser.run({
                    clientID: $scope.App.settings.soundcloud.clientID,
                    ffmpegPath: $scope.App.settings.directories.binary + '/ffmpeg.exe',
                    path: $scope.App.settings.directories.music,
                    force
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

        $scope.reshowSong = function () {
            // If we have info then reshow it with our known info as to prevent issues with no info on the receivers end
            if ($scope.nowPlaying.isPlaying) {
                let musicData = {
                    title: $scope.nowPlaying.title,
                    artist: $scope.nowPlaying.artist,
                    artwork: $scope.nowPlaying.artwork
                };

                request.post({url: 'http://localhost:28800/api/nowplaying/reshow/', json: musicData});
            } else {
                request.get({url: 'http://localhost:28800/api/nowplaying/reshow/'});
            }
        };

        function updateNowPlaying() {
            request.get({url: 'http://localhost:28800/foobar/state/', json: true}, function (err, response, body) {
                $timeout(function () {
                    $scope.nowPlaying.isPlaying = body.isPlaying === '1';

                    if (body.isPlaying === '1') {
                        let item = body.playlist[body.playingItem - (body.playlistItemsPerPage * (body.playlistPage - 1))];

                        if (item) {
                            $scope.nowPlaying.artist = item.a;
                            $scope.nowPlaying.title = item.t;
                            $scope.nowPlaying.artwork = body.albumArt;
                        }
                    }

                    $scope.$apply();
                });
            });
        }
    }
})();