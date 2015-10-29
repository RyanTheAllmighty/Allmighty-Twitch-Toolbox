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

    let async = require('async');

    angular.module('AllmightyTwitchToolbox').controller('DashboardController', ['$scope', '$timeout', 'Followers', 'Donations', 'Viewers', 'Stream', function ($scope, $timeout, Followers, Donations, Viewers, Stream) {
        $scope.streamOnline = false;
        $scope.viewerCount = 0;

        $scope.followersCount = 0;
        $scope.followersStart = 0;

        $scope.donationsTotal = 0;
        $scope.donationsStart = 0;

        $scope.viewsCount = 0;
        $scope.viewsStart = 0;

        // Followers count changed
        $scope.$on('followers-count-changed', function (event, number) {
            $timeout(function () {
                $scope.followersCount = number;
                $scope.$apply();
            });
        });

        // Views count changed
        $scope.$on('views-count-changed', function (event, number) {
            $timeout(function () {
                $scope.viewsCount = number;
                $scope.$apply();
            });
        });

        // Donations list updated
        $scope.$on('donations', function () {
            Donations.getDonationTotal(function (err, total) {
                if (err) {
                    return console.error(err);
                }

                $timeout(function () {
                    $scope.donationsTotal = total;
                    $scope.$apply();
                });
            });
        });

        // Stream is now online
        $scope.$on('stream-online', function (event, data) {
            $timeout(function () {
                $scope.streamOnline = true;
                $scope.followersStart = data.followers;
                $scope.$apply();
            });
        });

        // Stream is now offline
        $scope.$on('stream-offline', function (event, data) {
            $timeout(function () {
                $scope.streamOnline = false;
                $scope.followersStart = data.followers;
                $scope.$apply();
            });
        });

        updateStats();

        function updateStats() {
            async.parallel([
                function (next) {
                    Donations.getDonationTotal(function (err, total) {
                        if (err) {
                            return next(err);
                        }


                        $scope.donationsTotal = total;
                        next();
                    });
                },
                function (next) {
                    Stream.getLastStatus(function (err, status) {
                        if (err) {
                            return next(err);
                        }

                        $scope.streamOnline = status.online;

                        $scope.followersCount = status.followers;
                        $scope.followersStart = status.followers;

                        $scope.viewsCount = status.views;
                        $scope.viewsStart = status.views;

                        if (status.online) {
                            Viewers.getViewers(function (err, viewers) {
                                if (err) {
                                    return next(err);
                                }

                                $scope.viewerCount = viewers;
                                next();
                            });
                        } else {
                            next();
                        }
                    });
                }
            ], function (err) {
                if (err) {
                    console.error(err);
                }

                $timeout(function () {
                    $scope.$apply();
                });
            });
        }
    }]);
})();