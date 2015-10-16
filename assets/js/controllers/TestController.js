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

app.controller('TestController', ['$scope', 'Followers', 'Notification', function ($scope, Followers, Notification) {
    $scope.follower = {
        username: ''
    };

    $scope.testFollower = function () {
        let username = $scope.follower.username;

        $scope.follower.username = '';

        Followers.newFollower({username, date: new Date(), test: true});
        Notification.success({message: 'New follower triggered!', delay: 3000});
    };

    $scope.clearFollower = function () {
        $scope.follower.username = '';
    };
}]);