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

    angular.module('music', []);

    angular.module('music').factory('Music', musicFactory);

    musicFactory.$inject = ['$http'];

    function musicFactory($http) {
        return {
            previousSong,
            stopSong,
            nextSong,
            playPauseSong,
            reshowSong,
            getState,
            runMusicInformationParsing
        };

        function previousSong() {
            return new Promise(function (resolve, reject) {
                $http.get('http://localhost:28800/foobar/previous/').success(function (data) {
                    return resolve(data);
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function stopSong() {
            return new Promise(function (resolve, reject) {
                $http.get('http://localhost:28800/foobar/stop/').success(function (data) {
                    return resolve(data);
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function nextSong() {
            return new Promise(function (resolve, reject) {
                $http.get('http://localhost:28800/foobar/next/').success(function (data) {
                    return resolve(data);
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function playPauseSong() {
            return new Promise(function (resolve, reject) {
                $http.get('http://localhost:28800/foobar/pause/').success(function (data) {
                    return resolve(data);
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function reshowSong(data) {
            return new Promise(function (resolve, reject) {
                if (data) {
                    $http.post('http://localhost:28800/api/nowplaying/reshow/', data).success(function (data) {
                        return resolve(data);
                    }).error(function (data, code) {
                        return reject(data.error || 'An error occurred with status code ' + code);
                    });
                } else {
                    $http.get('http://localhost:28800/api/nowplaying/reshow/').success(function (data) {
                        return resolve(data);
                    }).error(function (data, code) {
                        return reject(data.error || 'An error occurred with status code ' + code);
                    });
                }
            });
        }

        function getState() {
            return new Promise(function (resolve, reject) {
                $http.get('http://localhost:28800/foobar/state/').success(function (data) {
                    return resolve(data);
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function runMusicInformationParsing(force) {
            return new Promise(function (resolve, reject) {
                $http.get('http://localhost:28800/api/tools/musicparser/run' + (force ? '?force=true' : '')).success(function (data) {
                    return resolve(data);
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }
    }
})();