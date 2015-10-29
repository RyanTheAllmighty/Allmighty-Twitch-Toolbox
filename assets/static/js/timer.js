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

/* global io, moment */

(function () {
    'use strict';

    function getSecondsLeft() {
        var secondsLeft = 0;

        $.ajax({
            url: 'http://127.0.0.1:' + window.customData.webPort + '/api/timer/' + (window.customData.timer.name ? window.customData.timer.name : window.customData.timer._id),
            type: 'GET',
            async: false,
            success: function (result) {
                secondsLeft = moment(result.date).diff(moment(), 'seconds');
            }
        });

        if (secondsLeft < 0) {
            secondsLeft = 0;
        }

        return secondsLeft;
    }

    $(document).ready(function () {
        var clock = $('#countdown').FlipClock({
            autoStart: false,
            countdown: true
        });

        var socket = io('http://127.0.0.1:' + window.customData.port);

        // Received a timer set event
        socket.on('timer-set', function (data) {
            if (data._id === window.customData.timer._id || data.name === window.customData.timer.name) {
                clock.stop();
                clock.setTime(moment(data.date).diff(moment(), 'seconds'));
                clock.start();
            }
        });

        // Received a timer deleted event
        socket.on('timer-deleted', function (data) {
            if (data._id === window.customData.timer._id || data.name === window.customData.timer.name) {
                clock.stop();
                clock.setTime(0);
            }
        });

        // Received a reload state event
        socket.on('reload-state', function () {
            clock.stop();
            clock.setTime(getSecondsLeft());
            clock.start();
        });

        clock.setTime(getSecondsLeft());
        clock.start();
    });
})();