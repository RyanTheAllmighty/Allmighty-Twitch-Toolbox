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

    angular.module('AllmightyTwitchToolbox').controller('TimersController', ['$scope', '$timeout', 'Timers', function ($scope, $timeout, Timers) {
        $scope.timers = [];
        $scope.settingTimer = {};

        function updateTimers() {
            $timeout(function () {
                Timers.getTimers(function (err, timers) {
                    if (err) {
                        console.log(err);
                    }

                    $scope.timers = timers;
                    $scope.$apply();
                });
            });
        }

        updateTimers();

        $scope.addTimer = function () {
            Timers.addTimer($('#createTimerPicker').data('DateTimePicker').date(), function (err) {
                if (err) {
                    console.log(err);
                }

                updateTimers();
            });
        };

        $scope.setTimer = function () {
            Timers.setTimer($('#editingTimerID').val(), $('#setTimerPicker').data('DateTimePicker').date(), function (err) {
                if (err) {
                    console.log(err);
                }

                updateTimers();
            });
        };

        $scope.deleteTimer = function (id) {
            Timers.deleteTimer(id, function (err) {
                if (err) {
                    console.log(err);
                }

                updateTimers();
            });
        };
    }]);
})();