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

    angular.module('timers', []);

    angular.module('timers').factory('Timers', timersFactory);

    timersFactory.$inject = ['$http'];

    function timersFactory($http) {
        return {
            addTimer,
            deleteTimer,
            getTimer,
            getTimers,
            setTimer
        };

        function addTimer(name, date) {
            return new Promise(function (resolve, reject) {
                $http.post('http://127.0.0.1:28800/api/timers', {name, date: date.toDate()}).success(function (timer) {
                    return resolve(timer);
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function deleteTimer(id) {
            return new Promise(function (resolve, reject) {
                $http.delete('http://127.0.0.1:28800/api/timers/' + id).success(function (data) {
                    return resolve(data);
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function getTimer(id) {
            return new Promise(function (resolve, reject) {
                $http.get('http://127.0.0.1:28800/api/timers/' + id).success(function (data) {
                    return resolve(data);
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function getTimers() {
            return new Promise(function (resolve, reject) {
                $http.get('http://127.0.0.1:28800/api/timers').success(function (data) {
                    return resolve(data);
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function setTimer(id, name, date) {
            return new Promise(function (resolve, reject) {
                $http.post('http://127.0.0.1:28800/api/timers/' + id, {name, date}).success(function (data) {
                    return resolve(data);
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }
    }
})();