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

/* global accounting, io, Vue */

(function () {
    'use strict';

    var vue = new Vue({
        el: '.alert',
        data: {
            username: '',
            message: ''
        }
    });

    var socket = io('http://127.0.0.1:28801');

    // Received new follower data
    socket.on('new-follower', function (data) {
        vue.username = data.display_name;
        vue.message = 'has followed the channel!';
        showAlert(window.customData.followerNotificationTime);
    });

    // Received new donation data
    socket.on('new-donation', function (data) {
        vue.username = data.username;
        vue.message = 'just donated ' + accounting.formatMoney(data.amount) + '!';
        showAlert(window.customData.donationNotificationTime);
    });

    function showAlert(time) {
        var $alert = $('.alert');

        $alert.transition({x: '505px'}, 500).transition({opacity: 0, delay: time - 1000}, 500, 'linear').transition({x: '-505px'}, 1).transition({opacity: 100}, 1);
    }
})();