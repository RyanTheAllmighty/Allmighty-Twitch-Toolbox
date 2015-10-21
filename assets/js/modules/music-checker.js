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

'use strict';

let fs = require('fs');
let mm = require('musicmetadata');
let ffmetadata = require('ffmetadata');

angular.module('music-checker', []);

angular.module('music-checker').provider('MusicChecker', function () {
    this.options = {};

    this.setOptions = function (options) {
        console.log('MusicCheckerProvider::setOptions()');
        if (!angular.isObject(options)) {
            throw new Error('Options should be an object!');
        }

        this.options = angular.extend({}, this.options, options);
    };

    this.$get = ['SocketIOServer', function (SocketIOServer) {
        console.log('MusicChecker::$get()');
        let self = this;

        return {
            startChecking: function () {
                fs.watchFile(self.options.nowPlayingPath, {persistent: true, interval: 100}, function () {
                    fs.readFile(self.options.nowPlayingPath, 'utf8', function (err, songPath) {
                        if (err) {
                            return console.error(err);
                        }

                        if (!fs.existsSync(songPath)) {
                            return console.error(new Error('The path ' + songPath + ' doesn\'t exist!'));
                        }

                        mm(fs.createReadStream(songPath), function (err, data) {
                            if (err) {
                                return console.error(err);
                            }

                            let songInfo = {
                                title: data.title,
                                artist: data.artist[0]
                            };

                            if (data.picture[0].data) {
                                songInfo.artwork = data.picture[0].data.toString('base64');
                            }

                            ffmetadata.read(songPath, {
                                ffmpegPath: self.options.ffmpegPath
                            }, function (err, mData) {
                                if (err) {
                                    return console.error(err);
                                }

                                songInfo.websites = {
                                    artist: mData.website,
                                    song: mData.soundcloud
                                };

                                SocketIOServer.emit('song', songInfo);
                            });
                        });
                    });
                });
            }
        };
    }];
});