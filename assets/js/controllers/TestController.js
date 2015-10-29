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

    angular.module('AllmightyTwitchToolbox').controller('TestController', ['$scope', 'Followers', 'Donations', 'Notification', function ($scope, Followers, Donations, Notification) {
        $scope.donation = {
            username: '',
            amount: 0
        };

        $scope.testDonation = function () {
            if ($scope.donation.username === '') {
                Notification.error({message: 'Username must be filled in!', delay: 3000});
            } else {
                let username = $scope.donation.username;
                let amount = $scope.donation.amount;

                $scope.clearDonation();

                Donations.newDonation({username, amount, note: 'Test', id: 1, date: new Date(), test: true});
                Notification.success({message: 'New donation triggered!', delay: 3000});
            }
        };

        $scope.clearDonation = function () {
            $scope.donation.username = '';
            $scope.donation.amount = 0;
        };

        $scope.follower = {
            username: ''
        };

        $scope.testFollower = function () {
            if ($scope.follower.username === '') {
                Notification.error({message: 'Username must be filled in!', delay: 3000});
            } else {
                let username = $scope.follower.username;

                $scope.clearFollower();

                Followers.newFollower({username, display_name: username, id: 1, date: new Date(), test: true});
                Notification.success({message: 'New follower triggered!', delay: 3000});
            }
        };

        $scope.clearFollower = function () {
            $scope.follower.username = '';
        };
    }]);
})();