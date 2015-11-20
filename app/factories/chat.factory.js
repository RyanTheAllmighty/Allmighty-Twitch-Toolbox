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

    angular.module('chat', []);

    angular.module('chat').factory('Chat', chatFactory);

    chatFactory.$inject = ['$http'];

    function chatFactory($http) {
        return {
            getAllMessages,
            ban,
            timeout,
            say,
            clear,
            slowmode,
            submode
        };

        function getAllMessages() {
            return new Promise(function (resolve, reject) {
                $http.get('http://127.0.0.1:28800/api/chat').success(function (data) {
                    return resolve(data);
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function ban(username) {
            return new Promise(function (resolve, reject) {
                $http.post('http://127.0.0.1:28800/api/chat/ban', {username}).success(function () {
                    return resolve();
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function timeout(username, seconds) {
            return new Promise(function (resolve, reject) {
                $http.post('http://127.0.0.1:28800/api/chat/timeout', {username, seconds}).success(function () {
                    return resolve();
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function say(message) {
            return new Promise(function (resolve, reject) {
                $http.post('http://127.0.0.1:28800/api/chat/say', {message}).success(function () {
                    return resolve();
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function clear() {
            return new Promise(function (resolve, reject) {
                $http.get('http://127.0.0.1:28800/api/chat/clear').success(function () {
                    return resolve();
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function slowmode(enabled, seconds) {
            return new Promise(function (resolve, reject) {
                if (enabled && !seconds) {
                    seconds = 300;
                }

                $http.post('http://127.0.0.1:28800/api/chat/slowmode', {enabled, seconds}).success(function () {
                    return resolve();
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function submode(enabled) {
            return new Promise(function (resolve, reject) {
                $http.post('http://127.0.0.1:28800/api/chat/submode', {enabled}).success(function () {
                    return resolve();
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }
    }
})();