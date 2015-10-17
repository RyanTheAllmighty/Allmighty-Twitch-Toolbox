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

/* globals app, _ */

'use strict';

app.controller('FollowersController', ['$scope', '$timeout', 'Followers', function ($scope, $timeout, Followers) {
    $scope.followers = [];

    Followers.getFollowers(100, function (err, followers) {
        if (err) {
            return console.error(err);
        }

        $scope.followers = followers;
    });

    $scope.$on('follower', function (event, data) {
        // Remove any followers that already have this username (since it's being updated)
        $scope.followers = _.reject($scope.followers, function (follower) {
            return follower.username === data.username;
        });

        // Then send the new data to the table
        $timeout(function () {
            $scope.followers.push(data);
            $scope.$apply();
        });
    });
}]);