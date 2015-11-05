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

    angular.module('AllmightyTwitchToolbox').controller('ToolsController', toolsController);

    toolsController.$inject = ['$scope', '$timeout', 'SocketIO', 'Music'];

    function toolsController($scope, $timeout, SocketIO, Music) {
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

        SocketIO.on('song-changed', function (info) {
            $scope.nowPlaying.isPlaying = true;
            $scope.nowPlaying.artist = info.artist;
            $scope.nowPlaying.title = info.title;
            $scope.nowPlaying.artwork = info.artwork;
        });

        SocketIO.on('tools-musicparser-started', function () {
            $scope.running.musicInformationParsing = true;
            $scope.log.musicInformationParsing = '';
        });

        SocketIO.on('tools-musicparser-finished', function () {
            $scope.running.musicInformationParsing = false;
            $scope.log.musicInformationParsing += '\nDone';
        });

        SocketIO.on('tools-musicparser-info', function (message) {
            $scope.log.musicInformationParsing += message;
        });

        SocketIO.on('tools-musicparser-error', function (err) {
            $scope.running.musicInformationParsing = false;
            $scope.log.musicInformationParsing += '\nError: ' + err.message;
        });

        updateNowPlaying();

        $scope.previousSong = function () {
            Music.previousSong().then(function () {
                $timeout(updateNowPlaying, 300);
            });
        };

        $scope.stopSong = function () {
            Music.stopSong().then(function () {
                $timeout(updateNowPlaying, 300);
            });
        };

        $scope.playPauseSong = function () {
            Music.playPauseSong().then(function () {
                $timeout(updateNowPlaying, 300);
            });
        };

        $scope.nextSong = function () {
            Music.nextSong().then(function () {
                $timeout(updateNowPlaying, 300);
            });
        };

        $scope.runMusicInformationParsing = function (force) {
            if (!$scope.running.musicInformationParsing) {
                Music.runMusicInformationParsing(force);
            }
        };

        $scope.reshowSong = function () {
            // If we have info then reshow it with our known info as to prevent issues with no info on the receivers end
            if ($scope.nowPlaying.isPlaying) {
                Music.reshowSong({
                    title: $scope.nowPlaying.title,
                    artist: $scope.nowPlaying.artist,
                    artwork: $scope.nowPlaying.artwork
                });
            } else {
                Music.reshowSong();
            }
        };

        function updateNowPlaying() {
            Music.getState().then(function (state) {
                $timeout(function () {
                    $scope.nowPlaying.isPlaying = state.isPlaying === '1';

                    if (state.isPlaying === '1') {
                        let item = state.playlist[state.playingItem - (state.playlistItemsPerPage * (state.playlistPage - 1))];

                        if (item) {
                            $scope.nowPlaying.artist = item.a;
                            $scope.nowPlaying.title = item.t;
                            $scope.nowPlaying.artwork = state.albumArt;
                        }
                    }

                    $scope.$apply();
                });
            });
        }
    }
})();