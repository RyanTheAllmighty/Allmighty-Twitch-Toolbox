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

    // NodeJS Modules
    let fs = require('fs');
    let _ = require('lodash');
    let path = require('path');
    let mm = require('musicmetadata');
    let ffmetadata = require('ffmetadata');

    let objectSymbol = Symbol();

    class FollowerChecker {
        constructor() {
            this[objectSymbol] = {
                interval: null
            };
        }

        get interval() {
            return this[objectSymbol].interval;
        }

        startChecking() {
            let self = this;

            return new Promise(function (resolve, reject) {
                if (self.interval) {
                    return reject(new Error('Music Checker already started!'));
                }

                global.services.settings.getGroup('directories').then(function (settings) {
                    fs.watchFile(path.join(_.result(_.findWhere(settings, {name: 'data'}), 'value'), 'NowPlayingPath.txt'), {persistent: true, interval: 100}, function () {
                        fs.readFile(path.join(_.result(_.findWhere(settings, {name: 'data'}), 'value'), 'NowPlayingPath.txt'), 'utf8', function (err, songPath) {
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
                                    ffmpegPath: path.join(_.result(_.findWhere(settings, {name: 'binary'}), 'value'), 'ffmpeg.exe')
                                }, function (err, mData) {
                                    if (err) {
                                        return console.error(err);
                                    }

                                    songInfo.websites = {
                                        artist: mData.website,
                                        song: mData.soundcloud
                                    };

                                    fs.writeFile(path.join(_.result(_.findWhere(settings, {name: 'data'}), 'value'), 'SongInfo.txt'), songInfo.title + ' by ' + songInfo.artist);
                                    fs.writeFile(path.join(_.result(_.findWhere(settings, {name: 'data'}), 'value'), 'SongInfo.json'), JSON.stringify(songInfo));

                                    global.services.socketIOEmit('song-changed', songInfo);
                                });
                            });
                        });
                    });
                }).catch(reject);

                return resolve();
            });
        }

        stopChecking() {
            let self = this;

            return new Promise(function (resolve, reject) {
                if (!self.interval) {
                    return reject(new Error('Music Checker not started!'));
                }

                clearInterval(self.interval);

                self[objectSymbol].interval = null;

                return resolve();
            });
        }
    }

    module.exports = FollowerChecker;
})();