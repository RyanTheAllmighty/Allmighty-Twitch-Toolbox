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

    var clock;

    function getSecondsLeft(cb) {
        $.ajax({
            url: 'http://127.0.0.1:28800/api/timers/' + (window.customData.timer.name ? window.customData.timer.name : window.customData.timer._id),
            type: 'GET',
            success: function (result) {
                cb(moment(result.date).diff(moment(), 'seconds'));
            }
        });
    }

    function setTimer(seconds) {
        if (!clock) {
            clock = $('#countdown').FlipClock({
                autoStart: false,
                countdown: true
            });
        }

        if (seconds < 0) {
            seconds = 0;
        }

        clock.setTime(seconds);
        clock.start();
    }

    function destroyClock() {
        clock.setTime(0);
        clock.stop();
        clock = null;
    }

    $(document).ready(function () {
        var socket = io('http://127.0.0.1:28800');

        // Received a timer set event
        socket.on('timer-set', function (data) {
            if (data._id === window.customData.timer._id || data.name === window.customData.timer.name) {
                setTimer(moment(data.date).diff(moment(), 'seconds'));
            }
        });

        // Received a timer deleted event
        socket.on('timer-deleted', function (data) {
            if (data._id === window.customData.timer._id || data.name === window.customData.timer.name) {
                destroyClock();
            }
        });

        // Received a reload state event
        socket.on('reload-state', function () {
            destroyClock();
            getSecondsLeft(setTimer);
        });

        getSecondsLeft(setTimer);
    });
})();