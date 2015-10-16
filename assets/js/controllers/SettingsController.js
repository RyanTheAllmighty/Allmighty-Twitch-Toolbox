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

/* globals app */

'use strict';

let _ = require('lodash');
let async = require('async');

app.controller('SettingsController', ['$scope', function ($scope) {
    $scope.settings = {
        network: {
            socketIOPort: 4000,
            webPort: 5000
        }
    };

    $scope.save = function () {
        async.forEachOf($scope.settings.network, function (value, key, next) {
            $scope.App.db.settings.update({name: 'network.' + key}, {name: 'network.' + key, value}, {upsert: true}, next);
        }, function (err) {
            if (err) {
                console.error(err);
                alert('There was an issue saving the settings!');
            } else {
                alert('Settings saved!');
            }
        });
    };
}]);