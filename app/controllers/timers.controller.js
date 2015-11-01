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

    let gui = require('nw.gui');

    angular.module('AllmightyTwitchToolbox').controller('TimersController', ['$scope', '$timeout', 'Timers', 'Notification', function ($scope, $timeout, Timers, Notification) {
        $scope.timers = [];

        function updateTimers() {
            $timeout(function () {
                Timers.getTimers(function (err, timers) {
                    if (err) {
                        console.error(err);
                        return Notification.error({message: err.message, delay: 3000});
                    }

                    $scope.timers = timers;
                    $scope.$apply();
                });
            });
        }

        updateTimers();

        $scope.addTimer = function () {
            Timers.addTimer($('#createTimerName').val(), $('#createTimerPicker').data('DateTimePicker').date(), function (err) {
                if (err) {
                    console.error(err);
                    return Notification.error({message: err.message, delay: 3000});
                }

                Notification.success({message: 'Timer Created!', delay: 3000});

                updateTimers();
            });
        };

        $scope.setTimer = function () {
            Timers.setTimer($('#editingTimerID').val(), $('#updateTimerName').val(), $('#setTimerPicker').data('DateTimePicker').date(), function (err) {
                if (err) {
                    console.error(err);
                    return Notification.error({message: err.message, delay: 3000});
                }

                Notification.success({message: 'Timer Set!', delay: 3000});

                updateTimers();
            });
        };

        $scope.addToTimer = function (timer, seconds) {
            Timers.addToTimer(timer._id, seconds, function (err) {
                if (err) {
                    console.error(err);
                    return Notification.error({message: err.message, delay: 3000});
                }

                Notification.success({message: 'Added time to timer!', delay: 3000});

                updateTimers();
            });
        };

        $scope.removeFromTimer = function (timer, seconds) {
            Timers.removeFromTimer(timer._id, seconds, function (err) {
                if (err) {
                    console.error(err);
                    return Notification.error({message: err.message, delay: 3000});
                }

                Notification.success({message: 'Removed time from timer!', delay: 3000});

                updateTimers();
            });
        };

        $scope.copyTimerURL = function (id) {
            Timers.getTimer(id, function (err, timer) {
                if (err) {
                    console.error(err);
                    return Notification.error({message: err.message, delay: 3000});
                }

                gui.Clipboard.get().set('http://localhost:' + $scope.App.settings.network.webPort + '/timer/' + (timer.name ? timer.name : timer._id), 'text');

                Notification.success({message: 'Link copied to clipboard!', delay: 3000});
            });
        };

        $scope.deleteTimer = function (id) {
            Timers.deleteTimer(id, function (err) {
                if (err) {
                    console.error(err);
                    return Notification.error({message: err.message, delay: 3000});
                }

                Notification.success({message: 'Timer Deleted!', delay: 3000});

                updateTimers();
            });
        };
    }]);
})();