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

/* globals moment */

(function () {
    'use strict';

    angular.module('AllmightyTwitchToolbox').controller('TimersController', timersController);

    timersController.$inject = ['$scope', '$timeout', 'Timers', 'Notification'];

    function timersController($scope, $timeout, Timers, Notification) {
        $scope.timers = [];

        function updateTimers() {
            $timeout(function () {
                Timers.getTimers().then(function (timers) {
                    $scope.timers = timers;
                    $scope.$apply();
                }).catch(function (err) {
                    console.error(err);
                    return Notification.error({message: err.message, delay: 3000});
                });
            });
        }

        updateTimers();

        $scope.addTimer = function () {
            Timers.addTimer($('#createTimerName').val(), $('#createTimerPicker').data('DateTimePicker').date()).then(function () {
                Notification.success({message: 'Timer Created!', delay: 3000});

                updateTimers();
            }).catch(function (err) {
                console.error(err);
                return Notification.error({message: err.message, delay: 3000});
            });
        };

        $scope.setTimer = function () {
            Timers.setTimer($('#editingTimerID').val(), $('#updateTimerName').val(), $('#setTimerPicker').data('DateTimePicker').date()).then(function () {
                Notification.success({message: 'Timer Set!', delay: 3000});

                updateTimers();
            }).catch(function (err) {
                console.error(err);
                return Notification.error({message: err.message, delay: 3000});
            });
        };

        $scope.addToTimer = function (timer, seconds) {
            Timers.setTimer(timer._id, timer.name, moment(timer.date).add(seconds, 'seconds').toDate()).then(function () {
                Notification.success({message: 'Added time to timer!', delay: 3000});

                updateTimers();
            }).catch(function (err) {
                console.error(err);
                return Notification.error({message: err.message, delay: 3000});
            });
        };

        $scope.removeFromTimer = function (timer, seconds) {
            Timers.setTimer(timer._id, timer.name, moment(timer.date).subtract(seconds, 'seconds').toDate()).then(function () {
                Notification.success({message: 'Removed time from timer!', delay: 3000});

                updateTimers();
            }).catch(function (err) {
                console.error(err);
                return Notification.error({message: err.message, delay: 3000});
            });
        };

        $scope.deleteTimer = function (id) {
            Timers.deleteTimer(id).then(function () {
                Notification.success({message: 'Timer Deleted!', delay: 3000});

                updateTimers();
            }).catch(function (err) {
                console.error(err);
                return Notification.error({message: err.message, delay: 3000});
            });
        };

        $scope.resetTimer = function (timer) {
            Timers.setTimer(timer._id, timer.name, new Date()).then(function () {
                Notification.success({message: 'Timer Reset!', delay: 3000});

                updateTimers();
            }).catch(function (err) {
                console.error(err);
                return Notification.error({message: err.message, delay: 3000});
            });
        };
    }
})();