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

    angular.module('AllmightyTwitchToolbox').controller('AuthController', authController);

    authController.$inject = ['$location', '$state', 'Settings', 'Notification'];

    function authController($location, $state, Settings, Notification) {
        // Fixes Twitch redirecting us back with #... rather than ?...
        $location.replace().url($location.url().replace('#', '?'));

        if (!$location.search().access_token) {
            Notification.error({message: 'Bad response received from Twitch!', delay: 3000});

            return $state.go('settings');
        }

        Settings.setTwitchAuth({
            accessToken: $location.search().access_token
        }).then(function () {
            Notification.success({message: 'Logged into Twitch!', delay: 3000});

            $state.go('settings');
        }).catch(function (err) {
            Notification.error({message: err.message, delay: 3000});

            $state.go('settings');
        });
    }
})();