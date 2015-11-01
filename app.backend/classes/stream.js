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

    let Datastore = require('./datastore');

    class Stream extends Datastore {
        constructor(options) {
            super('stream', options);
        }

        process(channelInfo, streamInfo) {
            let self = this;

            return new Promise(function (resolve, reject) {

                let statusData = {
                    followers: channelInfo.followers,
                    views: channelInfo.views,
                    game: channelInfo.game,
                    title: channelInfo.status,
                    online: streamInfo.stream !== null
                };

                self.getLastStatus().then(function (status) {
                    if (!_.isEqual(statusData, status)) {
                        self.datastore.insert(statusData, function (err) {
                            if (err) {
                                return reject(err);
                            }

                            if (status && statusData.followers !== status.followers) {
                                global.services.socketIOEmit('follower-count-changed', statusData.followers);
                            }

                            if (status && statusData.views !== status.views) {
                                global.services.socketIOEmit('view-count-changed', statusData.views);
                            }

                            if (status && statusData.game !== status.game) {
                                global.services.socketIOEmit('game-updated', statusData.game);
                            }

                            if (status && statusData.title !== status.title) {
                                global.services.socketIOEmit('title-updated', statusData.title);
                            }

                            if (statusData.online) {
                                self.isOnline().then(function (online) {
                                    if (!online) {
                                        global.services.socketIOEmit('stream-online', statusData);
                                    }

                                    return resolve();
                                }).catch(reject);
                            } else {
                                self.isOnline().then(function (online) {
                                    if (online) {
                                        global.services.socketIOEmit('stream-offline', statusData);
                                    }

                                    return resolve();
                                }).catch(reject);
                            }
                        });
                    } else {
                        return resolve();
                    }
                }).catch(reject);
            });
        }

        isOnline() {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.datastore.findOne({}).sort({date: -1}).limit(1).exec(function (err, status) {
                    if (err) {
                        return reject(err);
                    }

                    if (!status) {
                        return reject(new Error('No status has been stored!'));
                    }

                    return resolve(status.online);
                });
            });
        }

        getLastStatus() {
            let self = this;

            return new Promise(function (resolve, reject) {
                self.datastore.findOne({}).sort({date: -1}).limit(1).exec(function (err, status) {
                    if (err) {
                        return reject(err);
                    }

                    if (!status) {
                        return reject(new Error('No status has been stored!'));
                    }

                    return resolve(_.omit(status, '_id'));
                });
            });
        }

        setGame(game) {
            return new Promise(function (resolve, reject) {
                global.services.settings.getGroup('twitch').then(function (settings) {
                    global.services.twitchAPI.updateChannel(_.result(_.findWhere(settings, {name: 'username'}), 'value'), _.result(_.findWhere(settings, {name: 'accessToken'}), 'value'), {channel: {game}}, function (err) {
                        if (err) {
                            return reject(err);
                        }

                        return resolve();
                    });
                }).catch(reject);
            });
        }

        setTitle(title) {
            return new Promise(function (resolve, reject) {
                global.services.settings.getGroup('twitch').then(function (settings) {
                    global.services.twitchAPI.updateChannel(_.result(_.findWhere(settings, {name: 'username'}), 'value'), _.result(_.findWhere(settings, {name: 'accessToken'}), 'value'), {channel: {status: title}}, function (err) {
                        if (err) {
                            return reject(err);
                        }

                        return resolve();
                    });
                }).catch(reject);
            });
        }
    }

    module.exports = Stream;
})();