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

    let _ = require('lodash');

    angular.module('stream', []);

    angular.module('stream').factory('Stream', ['$http', function ($http) {
        return {
            isOnline,
            getLastStatus,
            setGame,
            setTitle
        };

        function isOnline() {
            return new Promise(function (resolve, reject) {
                $http.get('http://127.0.0.1:28800/api/stream').success(function (status) {
                    return resolve(status.online);
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function getLastStatus() {
            return new Promise(function (resolve, reject) {
                $http.get('http://127.0.0.1:28800/api/stream').success(function (status) {
                    return resolve(status);
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function setGame(game) {
            return new Promise(function (resolve, reject) {
                $http.post('http://127.0.0.1:28800/api/stream/game', {game}).success(function () {
                    return resolve();
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function setTitle(title) {
            return new Promise(function (resolve, reject) {
                $http.post('http://127.0.0.1:28800/api/stream/title', {title}).success(function () {
                    return resolve();
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }
    }]);
})();