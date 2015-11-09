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

/* globals async, _ */

(function () {
    'use strict';

    angular.module('AllmightyTwitchToolbox').controller('DashboardController', dashboardController);

    dashboardController.$inject = ['$scope', '$timeout', 'Donations', 'Viewers', 'Stream', 'GiantBomb', 'Notification', 'SocketIO', 'OBS', 'settings'];

    function dashboardController($scope, $timeout, Donations, Viewers, Stream, GiantBomb, Notification, SocketIO, OBS, settings) {
        $scope.streamOnline = false;
        $scope.obsOnline = false;
        $scope.viewerCount = 0;

        $scope.followersCount = 0;
        $scope.followersStart = 0;

        $scope.donationsTotal = 0;
        $scope.donationsStart = 0;

        $scope.viewsCount = 0;
        $scope.viewsStart = 0;

        $scope.droppedFrames = 0;
        $scope.framesPerSecond = 0;
        $scope.microphoneMuted = false;

        $scope.chatChannelName = _.result(_.findWhere(settings, {group: 'twitch', name: 'auth'}), 'value').username;
        $scope.chatOauth = 'oauth:' + _.result(_.findWhere(settings, {group: 'twitch', name: 'auth'}), 'value').accessToken;

        $scope.game = '';
        $scope.title = '';

        SocketIO.on('obs-stream-started', function () {
            $scope.obsOnline = true;
        });

        SocketIO.on('obs-stream-stopped', function () {
            $scope.obsOnline = false;
        });

        SocketIO.on('obs-status-changed', function (data) {
            $scope.droppedFrames = data.droppedFrames;
            $scope.framesPerSecond = data.framesPerSecond;
        });

        SocketIO.on('follower-count-changed', function (number) {
            $scope.followersCount = number;
        });

        SocketIO.on('view-count-changed', function (number) {
            $scope.viewsCount = number;
        });

        SocketIO.on('game-updated', function (game) {
            $scope.game = game;
        });

        SocketIO.on('title-updated', function (title) {
            $scope.title = title;
        });

        SocketIO.on('donations', function () {
            Donations.getTotal().then(function (total) {
                $timeout(function () {
                    $scope.donationsTotal = total;
                    $scope.$apply();
                });
            }).catch(function (err) {
                console.error(err);
            });
        });

        SocketIO.on('stream-online', function (data) {
            $scope.streamOnline = true;
            $scope.followersStart = data.followers;
        });

        SocketIO.on('stream-offline', function (data) {
            $scope.streamOnline = false;
            $scope.followersStart = data.followers;
        });

        $scope.searchGames = function (val) {
            return GiantBomb.searchGames(val, {namesOnly: true, limit: 5}).then(function (games) {
                return games;
            }, function (err) {
                console.error(err);
            });
        };

        $scope.setGame = function () {
            if ($scope.gameSelected) {
                Stream.setGame($scope.gameSelected).then(function () {
                    Notification.success({message: 'Game Updated!', delay: 3000});
                }).catch(function (err) {
                    return Notification.error({message: err.message, delay: 3000});
                });
            }
        };

        $scope.setTitle = function () {
            if ($scope.titleSelected) {
                Stream.setTitle($scope.titleSelected).then(function () {
                    Notification.success({message: 'Title Updated!', delay: 3000});
                }).catch(function (err) {
                    return Notification.error({message: err.message, delay: 3000});
                });
            }
        };

        updateStats();

        function updateStats() {
            async.parallel([
                function (next) {
                    Donations.getTotal().then(function (total) {
                        $scope.donationsTotal = total;
                        next();
                    }).catch(next);
                },
                function (next) {
                    Stream.getLastStatus().then(function (status) {
                        $scope.streamOnline = status.online;

                        $scope.followersCount = status.followers;
                        $scope.followersStart = status.followers;

                        $scope.viewsCount = status.views;
                        $scope.viewsStart = status.views;

                        $scope.game = status.game;
                        $scope.title = status.title;

                        $scope.gameSelected = status.game;
                        $scope.titleSelected = status.title;

                        if (status.online) {
                            Viewers.getViewers().then(function (viewers) {
                                $scope.viewerCount = viewers;
                                next();
                            }).catch(next);
                        } else {
                            next();
                        }
                    }).catch(next);
                },
                function (next) {
                    OBS.isStreaming().then(function (streaming) {
                        $scope.obsOnline = streaming;

                        next();
                    }).catch(next);
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
    }
})();