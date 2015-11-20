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

/* global io, Vue */

(function () {
    'use strict';

    var $transition = null;

    var vue = new Vue({
        el: '.songInfo',
        data: {
            nowPlaying: {}
        }
    });

    var socket = io('http://127.0.0.1:28800');

    // Received song data
    socket.on('song-changed', function (data) {
        vue.nowPlaying = data;
        if (!vue.nowPlaying.title) {
            vue.nowPlaying.title = 'Unknown';
        }

        showSongInfo();
    });

    // Asked to reshow the current song's data
    socket.on('song-reshow', function (data) {
        if (data) {
            vue.nowPlaying = data;
            if (!vue.nowPlaying.title) {
                vue.nowPlaying.title = 'Unknown';
            }
        }

        showSongInfo();
    });

    // Received reload event
    socket.on('scenes-reload', function () {
        location.reload();
    });

    function showSongInfo() {
        var $songInfo = $('.songInfo');

        if ($transition) {
            $transition.stopTransition();
            $songInfo.removeAttr('style');
        }

        $transition = $songInfo.transition({x: '-170px'}).transition({
            opacity: 0,
            delay: window.customData.musicChangeNotificationTime - 500
        }, 500, 'linear').transition({x: '165px'}).transition({opacity: 100}, function () {
            $transition = null;
        });
    }
})();