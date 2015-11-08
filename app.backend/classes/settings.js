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

    let _ = require('lodash');
    let async = require('async');

    let Datastore = require('./datastore');

    let defaultSettings = {
        twitch: {
            redirectURI: 'http://127.0.0.1:28800/#/auth/twitch',
            clientID: '62gqva8j7h003ar84w0gprmu8ebrqth',
            scopes: ['user_read', 'chat_login'],
            auth: {
                accessToken: '',
                scopes: '',
                clientID: '',
                username: ''
            }
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
        },
        obs: {
            remotePassword: '',
            muteMicrophoneHotkey: 'Ctrl+Alt+B'
        },
        application: {
            hasSetup: false
        }
    };

    class Settings extends Datastore {
        constructor(options) {
            super('settings', options);
        }

        checkSettings() {
            let self = this;

            return new Promise(function (resolve, reject) {
                let ourSettings = {};

                self.getAll().then(function (settings) {
                    if (settings.length === 0) {
                        ourSettings = defaultSettings;

                        self.setAll(ourSettings).then(resolve).catch(reject);
                    } else {
                        _.forEach(settings, function (setting) {
                            if (!ourSettings[setting.group]) {
                                ourSettings[setting.group] = {};
                            }

                            if (!ourSettings[setting.group][setting.name]) {
                                ourSettings[setting.group][setting.name] = {};
                            }

                            ourSettings[setting.group][setting.name] = setting.value;
                        });

                        let needToSave = false;

                        // This will set defaults for new settings that aren't defined in the settings DB yet
                        async.forEachOf(defaultSettings, function (value, group, next) {
                            if (typeof ourSettings[group] === 'undefined') {
                                needToSave = true;
                                ourSettings[group] = value;
                            } else {
                                Object.keys(value).forEach(function (name) {
                                    if (typeof ourSettings[group][name] === 'undefined') {
                                        needToSave = true;
                                        ourSettings[group][name] = value[name];
                                    }
                                });
                            }

                            next();
                        }, function (err) {
                            if (err) {
                                return reject(err);
                            }

                            // User hasn't authenticated with Twitch
                            if (!ourSettings.twitch.auth.accessToken || !ourSettings.twitch.auth.username || !ourSettings.twitch.auth.scopes || !ourSettings.twitch.auth.clientID) {
                                ourSettings.twitch.auth = defaultSettings.twitch.auth;
                                ourSettings.application.hasSetup = false;

                                needToSave = true;
                            } else {
                                // User's auth doesn't have the correct scopes anymore
                                if (_.difference(ourSettings.twitch.auth.scopes, defaultSettings.twitch.scopes).length !== 0) {
                                    ourSettings.twitch.auth = defaultSettings.twitch.auth;
                                    ourSettings.application.hasSetup = false;

                                    needToSave = true;
                                }

                                // User changed the client ID
                                if (ourSettings.twitch.auth.clientID !== ourSettings.twitch.clientID) {
                                    ourSettings.twitch.auth = defaultSettings.twitch.auth;
                                    ourSettings.application.hasSetup = false;

                                    needToSave = true;
                                }
                            }

                            if (needToSave) {
                                self.setAll(ourSettings).then(resolve).catch(reject);
                            } else {
                                return resolve();
                            }
                        });
                    }
                }).catch(reject);
            });
        }

        get(group, name) {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.datastore.findOne({$and: [{group}, {name}]}, function (err, doc) {
                    if (err) {
                        return reject(err);
                    }

                    if (!doc) {
                        return reject(new Error('No setting found!'));
                    }

                    return resolve(_.omit(doc, '_id'));
                });
            });
        }

        getAll() {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.datastore.find({}, function (err, docs) {
                    if (err) {
                        return reject(err);
                    }

                    docs = _.map(docs, function (entry) {
                        return _.omit(entry, '_id');
                    });

                    return resolve(docs);
                });
            });
        }

        getGroup(group) {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.datastore.find({group}, function (err, docs) {
                    if (err) {
                        return reject(err);
                    }

                    if (docs.length === 0) {
                        return reject(new Error('No settings found!'));
                    }

                    docs = _.map(docs, function (entry) {
                        return _.omit(entry, '_id');
                    });

                    return resolve(docs);
                });
            });
        }

        set(group, name, value) {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.datastore.update({group, name}, {$set: {value}}, {upsert: true}, function (err, numReplaced, newDoc) {
                    if (err) {
                        return reject(err);
                    }

                    if (numReplaced === 0 && !newDoc) {
                        return reject(new Error('Setting not saved!'));
                    }

                    return resolve();
                });
            });
        }

        setAll(settings) {
            let self = this;

            return new Promise(function (resolve, reject) {
                async.each(Object.keys(settings), function (group, nextMain) {
                    async.forEachOf(settings[group], function (value, key, next) {
                        self.datastore.update({group, name: key}, {group, name: key, value}, {upsert: true}, next);
                    }, nextMain);
                }, function (err) {
                    if (err) {
                        return reject(err);
                    }

                    return resolve();
                });
            });
        }
    }

    module.exports = Settings;
})();