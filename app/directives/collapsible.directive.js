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

    angular.module('AllmightyTwitchToolbox').directive('collapsible', collapsibleDirective);

    collapsibleDirective.$inject = ['$compile'];

    function collapsibleDirective($compile) {
        return {
            restrict: 'E',
            link: function (scope, element, attrs) {
                var html = [];
                html.push('<span class="pull-right clickable" ng-click="_updateCollapse(\'' + attrs.model + '\')">');
                html.push('<i class="glyphicon" ng-class="{\'glyphicon-chevron-up\': ' + attrs.model + ', \'glyphicon-chevron-down\': !' + attrs.model + '}"></i>');
                html.push('</span>');
                element.html(html.join(''));
                $compile(element.contents())(scope);
            }
        };
    }
})();