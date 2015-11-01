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

    let AutoLinker = require('autolinker');

    angular.module('AllmightyTwitchToolbox').filter('autolink', function () {
        let linker = new AutoLinker({
            email: false,
            phone: false
        });

        return function (input) {
            return linker.link(input).replace('href=', 'ng-click="openLinkInBrowser()" href=');
        };
    });
})();