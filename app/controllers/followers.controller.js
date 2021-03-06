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

    angular.module('AllmightyTwitchToolbox').controller('FollowersController', followersController);

    followersController.$inject = ['$scope', 'Followers', 'DTOptionsBuilder', 'DTColumnBuilder', 'SocketIO'];

    function followersController($scope, Followers, DTOptionsBuilder, DTColumnBuilder, SocketIO) {
        let getFollowers = function () {
            return Followers.getAllFollowers({order: 'desc'});
        };

        // The instance of the dataTable
        $scope.dtInstance = {};

        $scope.dtOptions = DTOptionsBuilder.fromFnPromise(getFollowers).withPaginationType('full').withOption('order', [[1, 'desc']]).withBootstrap();

        $scope.dtColumns = [
            DTColumnBuilder.newColumn('display_name').withTitle('Username'),
            DTColumnBuilder.newColumn('date').withTitle('Date Followed').withOption('bSearchable', false).withOption('type', 'date')
        ];

        function changeData() {
            // Reload the data in the table
            $scope.dtInstance.changeData(getFollowers);
        }

        SocketIO.on('followers', changeData);
        SocketIO.on('new-follower', changeData);
    }
})();