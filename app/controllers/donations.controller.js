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

    angular.module('AllmightyTwitchToolbox').controller('DonationsController', ['$scope', 'Donations', 'DTOptionsBuilder', 'DTColumnBuilder', function ($scope, Donations, DTOptionsBuilder, DTColumnBuilder) {
        let getDonations = function () {
            return Donations.getDonations({limit: 100, order: 'desc'});
        };

        // The instance of the dataTable
        $scope.dtInstance = {};

        $scope.dtOptions = DTOptionsBuilder.fromFnPromise(getDonations).withPaginationType('full').withOption('order', [[3, 'desc']]).withBootstrap();

        $scope.dtColumns = [
            DTColumnBuilder.newColumn('username').withTitle('Username'),
            DTColumnBuilder.newColumn('amount').withTitle('Amount').renderWith(function (data) {
                return accounting.formatMoney(data);
            }),
            DTColumnBuilder.newColumn('note').withTitle('Note'),
            DTColumnBuilder.newColumn('date').withTitle('Date Donated').withOption('bSearchable', false).withOption('type', 'date')
        ];

        function changeData() {
            // Reload the data in the table
            $scope.dtInstance.changeData(getDonations);
        }

        // Donations list updated
        $scope.$on('donations', changeData);

        // New donation
        $scope.$on('new-donation', changeData);
    }]);
})();