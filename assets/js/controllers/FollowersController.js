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

app.controller('FollowersController', ['$scope', 'Followers', 'DTOptionsBuilder', 'DTColumnBuilder', function ($scope, Followers, DTOptionsBuilder, DTColumnBuilder) {
    let getFollowers = function () {
        return Followers.getFollowersPromise(100);
    };

    // The instance of the dataTable
    $scope.dtInstance = {};

    $scope.dtOptions = DTOptionsBuilder.fromFnPromise(getFollowers).withPaginationType('full_numbers').withOption('order', [[1, 'desc']]).withBootstrap();

    $scope.dtColumns = [
        DTColumnBuilder.newColumn('username').withTitle('Username'),
        DTColumnBuilder.newColumn('date').withTitle('Date Followed').withOption('bSearchable', false)
    ];

    // New follower
    $scope.$on('follower', function () {
        // Reload the data in the table
        $scope.dtInstance.changeData(getFollowers);
    });
}]);