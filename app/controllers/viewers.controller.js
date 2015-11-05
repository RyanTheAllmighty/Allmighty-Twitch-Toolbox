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

/* globals _, accounting, d3 */

(function () {
    'use strict';

    angular.module('AllmightyTwitchToolbox').controller('ViewersController', viewersController);

    viewersController.$inject = ['$scope', 'Viewers', 'SocketIO'];

    function viewersController($scope, Viewers, SocketIO) {
        $scope.chart = {
            options: {
                chart: {
                    type: 'lineChart',
                    height: 500,
                    margin: {
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 80
                    },
                    showXAxis: false,
                    showLegend: false,
                    transitionDuration: 500,
                    xAxis: {
                        axisLabel: 'Date',
                        tickFormat: function (d) {
                            return d3.time.format('%c')(new Date(d));
                        }
                    },
                    x2Axis: {
                        axisLabel: 'Date',
                        tickFormat: function (d) {
                            return d3.time.format('%c')(new Date(d));
                        }
                    },
                    yAxis: {
                        axisLabel: 'Viewers',
                        tickFormat: function (d) {
                            return accounting.formatNumber(d);
                        }
                    },
                    y2Axis: {
                        axisLabel: 'Viewers',
                        tickFormat: function (d) {
                            return accounting.formatNumber(d);
                        }
                    }
                }
            },
            data: [{values: [], key: 'Viewers'}]
        };

        let getViewers = function () {
            Viewers.getViewers({limit: 100}).then(function (data) {
                $scope.chart.data[0].values = _.map(data.viewers, function (item) {
                    return {
                        x: item.date.getTime(),
                        y: item.count
                    };
                });

                $scope.chart.api.update();
            }).catch(function (err) {
                console.error(err);
            });
        };

        getViewers();

        SocketIO.on('viewer-count-changed', getViewers);
    }
})();