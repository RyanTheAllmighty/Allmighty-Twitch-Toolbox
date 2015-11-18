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

    angular.module('AllmightyTwitchToolbox').controller('TestController', testController);

    testController.$inject = ['$scope', 'Followers', 'Donations', 'Notification', 'Host'];

    function testController($scope, Followers, Donations, Notification, Host) {
        $scope.donation = {
            username: '',
            amount: 0
        };

        $scope.testDonation = function () {
            if ($scope.donation.username === '') {
                Notification.error({message: 'Username must be filled in!', delay: 3000});
            } else if ($scope.donation.amount < 0) {
                Notification.error({message: 'Amount cannot be less than 0!', delay: 3000});
            } else {
                let username = $scope.donation.username;
                let amount = $scope.donation.amount;

                $scope.clearDonation();

                Donations.testDonation({username, amount, note: 'Test', id: 1, date: new Date(), test: true}).then(function () {
                    Notification.success({message: 'New donation triggered!', delay: 3000});
                }).catch(function (err) {
                    Notification.error({message: err.message, delay: 3000});
                });
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

                Followers.testFollower({username, display_name: username, id: 1, date: new Date(), test: true}).then(function () {
                    Notification.success({message: 'New follower triggered!', delay: 3000});
                }).catch(function (err) {
                    Notification.error({message: err.message, delay: 3000});
                });
            }
        };

        $scope.clearFollower = function () {
            $scope.follower.username = '';
        };

        $scope.host = {
            username: '',
            viewers: 0
        };

        $scope.testHost = function () {
            if ($scope.host.username === '') {
                Notification.error({message: 'Username must be filled in!', delay: 3000});
            } else if ($scope.host.viewers < 0) {
                Notification.error({message: 'Viewers cannot be less than 0!', delay: 3000});
            } else {
                let username = $scope.host.username;
                let viewers = $scope.host.viewers;

                $scope.clearHost();

                Host.testHost({username, viewers, date: new Date(), test: true}).then(function () {
                    Notification.success({message: 'New host triggered!', delay: 3000});
                }).catch(function (err) {
                    Notification.error({message: err.message, delay: 3000});
                });
            }
        };

        $scope.clearHost = function () {
            $scope.host.username = '';
            $scope.host.viewers = 0;
        };
    }
})();