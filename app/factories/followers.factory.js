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

    angular.module('followers', []);

    angular.module('followers').factory('Followers', followersFactory);

    followersFactory.$inject = ['$http'];

    function followersFactory($http) {
        return {
            testFollower,
            getFollows,
            getFollowers,
            getCount,
            deleteAll
        };

        function testFollower(data) {
            return new Promise(function (resolve, reject) {
                $http.post('http://127.0.0.1:28800/api/followers/test', data).success(function () {
                    return resolve();
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function getFollows(options) {
            return new Promise(function (resolve, reject) {
                let urlOpts = '?';

                _.forEach(options, function (value, key) {
                    urlOpts += key + '=' + value + '&';
                });

                $http.get('http://127.0.0.1:28800/api/followers' + urlOpts).success(function (data) {
                    return resolve(data);
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function getFollowers(options) {
            return new Promise(function (resolve, reject) {
                let urlOpts = '?';

                _.forEach(options, function (value, key) {
                    urlOpts += key + '=' + value + '&';
                });

                $http.get('http://127.0.0.1:28800/api/followers' + urlOpts).success(function (data) {
                    return resolve(data.followers);
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function getCount() {
            return new Promise(function (resolve, reject) {
                $http.get('http://127.0.0.1:28800/api/followers/count').success(function (count) {
                    return resolve(count);
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }

        function deleteAll() {
            return new Promise(function (resolve, reject) {
                $http.delete('http://127.0.0.1:28800/api/followers').success(resolve).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }
    }
})();