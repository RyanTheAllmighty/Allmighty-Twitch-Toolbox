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

    angular.module('settings', []);

    angular.module('settings').factory('Settings', settingsFactory);

    settingsFactory.$inject = ['$http'];

    function settingsFactory($http) {
        return {
            getSetting,
            getAll,
            getGroup,
            setAll,
            getTwitchLoginURL,
            setTwitchAuth
        };

        function getSetting(group, name) {
            return new Promise(function (resolve, reject) {
                $http.get('http://127.0.0.1:28800/api/settings/' + group + '/' + name).success(function (data) {
                    return resolve(data);
                }).error(function (data, code) {
                    return reject(new Error(data.error || 'An error occurred with status code ' + code));
                });
            });
        }

        function getGroup(group) {
            return new Promise(function (resolve, reject) {
                $http.get('http://127.0.0.1:28800/api/settings/' + group).success(function (data) {
                    return resolve(data);
                }).error(function (data, code) {
                    return reject(new Error(data.error || 'An error occurred with status code ' + code));
                });
            });
        }

        function getAll() {
            return new Promise(function (resolve, reject) {
                $http.get('http://127.0.0.1:28800/api/settings').success(function (data) {
                    return resolve(data);
                }).error(function (data, code) {
                    return reject(new Error(data.error || 'An error occurred with status code ' + code));
                });
            });
        }

        function setAll(settings) {
            return new Promise(function (resolve, reject) {
                $http.post('http://127.0.0.1:28800/api/settings', settings).success(function () {
                    return resolve();
                }).error(function (data, code) {
                    return reject(new Error(data.error || 'An error occurred with status code ' + code));
                });
            });
        }

        function getTwitchLoginURL() {
            return new Promise(function (resolve, reject) {
                $http.get('http://127.0.0.1:28800/api/auth/twitch/url').success(function (url) {
                    return resolve(url);
                }).error(function (data, code) {
                    return reject(new Error(data.error || 'An error occurred with status code ' + code));
                });
            });
        }

        function setTwitchAuth(details) {
            return new Promise(function (resolve, reject) {
                $http.post('http://127.0.0.1:28800/api/auth/twitch', details).success(resolve).error(function (data, code) {
                    return reject(new Error(data.error || 'An error occurred with status code ' + code));
                });
            });
        }
    }
})();