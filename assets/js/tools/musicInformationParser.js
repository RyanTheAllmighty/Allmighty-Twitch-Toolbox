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
let _ = require('lodash');
let http = require('http');
let path = require('path');
let async = require('async');
let https = require('https');
let SC = require('node-soundcloud');
let ffmetadata = require('ffmetadata');
let EventEmitter = require('events').EventEmitter;

/**
 * Walks through a given directory recursively, returning an array of all the files ending in .mp3
 *
 * @param {String} dir
 * @returns {String[]}
 */
let findAllMP3Files = function (dir) {
    var results = [];
    var list = fs.readdirSync(dir);

    list.forEach(function (file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(findAllMP3Files(file));
        } else if (file.substr(-4) === '.mp3') {
            results.push(file);
        }
    });

    return results;
};

module.exports = {
    run: function (incOpts) {
        let ee = new EventEmitter();

        process.nextTick(function () {
            SC.init({
                id: incOpts.clientID
            });

            let files = findAllMP3Files(incOpts.path);

            async.eachSeries(files, function (filename, next) {
                ee.emit('info', 'Processing ' + filename);

                let dir = path.dirname(filename);
                let artistName = path.basename(dir);
                let name = path.basename(filename).substr(0, path.basename(filename).length - 4);
                let websiteTxt = path.join(dir, 'website.txt');
                let coverArt = path.join(dir, name + '.jpg');
                let artistArt = path.join(dir, 'artist.jpg');

                let data = {};

                let options = {
                    ffmpegPath: incOpts.ffmpegPath
                };

                ffmetadata.read(filename, options, function (err, readData) {
                    if (err) {
                        return next(err);
                    }

                    // Check if this file has already been processed, and if so (and we're not passing the force option) then we skip it
                    if (readData.ATTProcessed && !incOpts.force) {
                        ee.emit('info', ' - Already Processed, Skipping\n');
                        return next();
                    }

                    SC.get('/users', {
                        q: artistName
                    }, function (err, res) {
                        if (err) {
                            return next(err);
                        }

                        if (res.length === 0) {
                            return next(new Error('Cannot find artist on SoundCloud!'));
                        }

                        let artist = res[0];

                        data.artist = artist.username;
                        data.title = readData.title || name;
                        data.website = artist.permalink_url;

                        ee.emit('info', ' - ' + artist.username);

                        let getTrack = function (artist, callback) {
                            SC.get('/users/' + artist.id + '/tracks', function (err, tracks) {
                                if (err) {
                                    return callback(err);
                                }

                                if (tracks.length === 0) {
                                    return callback();
                                }

                                let theTrack = _.find(tracks, function (track) {
                                    return track.title.indexOf(name) !== -1;
                                });

                                if (!theTrack) {
                                    return callback();
                                }

                                SC.get('/tracks/' + theTrack.id, function (err, track) {
                                    if (err) {
                                        return callback(err);
                                    }

                                    data.soundcloud = track.permalink_url;

                                    ee.emit('info', ' - ' + track.title);

                                    if (track.artwork_url) {
                                        var request = (artist.avatar_url.substr(0, 5) === 'https' ? https : http).get(track.artwork_url.replace('-large.jpg', '-t500x500.jpg'), function (response) {
                                            response.pipe(fs.createWriteStream(coverArt));
                                        });

                                        request.on('close', function () {
                                            callback();
                                        });
                                    } else {
                                        callback();
                                    }
                                });
                            });
                        };

                        let writeMetadata = function (callback) {
                            if (fs.existsSync(coverArt)) {
                                ee.emit('info', ' - Cover Art');
                                options.attachments = [coverArt];
                            } else if (fs.existsSync(artistArt)) {
                                ee.emit('info', ' - Artist Art');
                                options.attachments = [artistArt];
                            }

                            // This is used internally to tell what's been processed
                            data.ATTProcessed = 'Yes';

                            ffmetadata.write(filename, data, options, function (err) {
                                ee.emit('info', ' - ' + (err ? 'Error' : 'Done') + '\n');

                                if (fs.existsSync(websiteTxt)) {
                                    fs.unlinkSync(websiteTxt);
                                }

                                if (fs.existsSync(artistArt)) {
                                    fs.unlinkSync(artistArt);
                                }

                                if (fs.existsSync(coverArt)) {
                                    fs.unlinkSync(coverArt);
                                }

                                callback(err);
                            });
                        };

                        let toDo = function () {
                            getTrack(artist, function (err) {
                                if (err) {
                                    ee.emit('error', err);
                                } else {
                                    writeMetadata(next);
                                }

                            });
                        };

                        if (artist.avatar_url) {
                            var request = (artist.avatar_url.substr(0, 5) === 'https' ? https : http).get(artist.avatar_url.replace('-large.jpg', '-t500x500.jpg'), function (response) {
                                response.pipe(fs.createWriteStream(artistArt));
                            });

                            request.on('close', toDo);
                        } else {
                            toDo();
                        }
                    });
                });
            }, function (err) {
                if (err) {
                    ee.emit('error', err);
                } else {
                    ee.emit('done');
                }
            });
        });

        return ee;
    }
};