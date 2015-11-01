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

let async = require('async');

let defaultSettings = {
    twitch: {
        username: '',
        apiToken: '',
        apiClientID: ''
    },
    streamtip: {
        accessToken: '',
        clientID: ''
    },
    soundcloud: {
        clientID: ''
    },
    giantbomb: {
        apiKey: ''
    },
    checks: {
        donations: 10,
        followers: 10,
        stream: 10
    },
    network: {
        foobarHttpControlPort: 8888
    },
    sounds: {
        newDonation: '',
        newDonationVolume: 1.0,
        newFollower: '',
        newFollowerVolume: 1.0
    },
    notifications: {
        donationNotificationTime: 5,
        followerNotificationTime: 5,
        musicChangeNotificationTime: 5
    },
    directories: {
        binary: '',
        data: '',
        music: ''
    }
};

module.exports.loadSettings = function (callback) {
    let self = this;

    global.App.db.settings.find({}, function (err, docs) {
        if (err) {
            return callback(err);
        }

        // If there are no settings in the database then set some defaults and then save them
        if (docs.length === 0) {
            global.App.settings = defaultSettings;

            return self.saveSettings(callback);
        }

        async.each(docs, function (doc, next) {
            if (!global.App.settings[doc.group]) {
                global.App.settings[doc.group] = {};
            }

            global.App.settings[doc.group][doc.name] = doc.value;
            next();
        }, function (err) {
            if (err) {
                return callback(err);
            }

            let needToSave = false;

            // This will set defaults for new settings that aren't defined in the settings DB yet
            async.forEachOf(defaultSettings, function (value, group, next) {
                if (typeof global.App.settings[group] === 'undefined') {
                    needToSave = true;
                    global.App.settings[group] = value;
                } else {
                    Object.keys(value).forEach(function (name) {
                        if (typeof global.App.settings[group][name] === 'undefined') {
                            needToSave = true;
                            global.App.settings[group][name] = value[name];
                        }
                    });
                }

                next();
            }, function (err) {
                if (err) {
                    return callback(err);
                }

                if (needToSave) {
                    return self.saveSettings(callback);
                }

                callback();
            });
        });
    });
};

module.exports.saveSettings = function (callback) {
    async.each(Object.keys(global.App.settings), function (group, nextMain) {
        async.forEachOf(global.App.settings[group], function (value, key, next) {
            global.App.db.settings.update({group, name: key}, {group, name: key, value}, {upsert: true}, next);
        }, nextMain);
    }, callback);
};