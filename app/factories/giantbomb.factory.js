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

    angular.module('giantbomb', []);

    angular.module('giantbomb').factory('GiantBomb', streamFactory);

    streamFactory.$inject = ['$http'];

    function streamFactory($http) {
        return {
            searchGames
        };

        function searchGames(title, options) {
            return new Promise(function (resolve, reject) {
                let urlOpts = '?';

                _.forEach(options, function (value, key) {
                    urlOpts += key + '=' + value + '&';
                });

                $http.post('http://127.0.0.1:28800/api/giantbomb/search/games' + urlOpts, {title}).success(function (games) {
                    return resolve(games);
                }).error(function (data, code) {
                    return reject(data.error || 'An error occurred with status code ' + code);
                });
            });
        }
    }
})();