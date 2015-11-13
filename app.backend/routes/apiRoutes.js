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
    let _ = require('lodash');
    let path = require('path');
    let express = require('express');

    // The Express router
    let router = express.Router();

    // Include our services module
    let services = require(path.join(process.cwd(), 'app.backend', 'services'));

    let musicInformationParser = require(path.join(process.cwd(), 'app.backend', 'tools', 'musicInformationParser'));

    router.get('/auth/twitch/url', function (req, res) {
        res.json(global.services.twitchAPI.getAuthorizationUrl().replace('response_type=code', 'response_type=token'));
    });

    router.post('/auth/twitch', function (req, res) {
        let auth = req.body;

        if (!auth.accessToken) {
            return res.status(500).send({error: 'Invalid request received!'});
        }

        global.services.twitchAPI.getRoot(auth.accessToken, function (err, data) {
            if (err) {
                return res.status(500).send({error: err.message});
            }
            global.services.settings.get('twitch', 'clientID').then(function (setting) {
                auth.scopes = data.token.authorization.scopes;
                auth.username = data.token.user_name;
                auth.clientID = setting.value;

                global.services.settings.set('twitch', 'auth', auth).then(function () {
                    global.services.settings.set('application', 'hasSetup', true).then(function () {
                        res.json({
                            success: true
                        });
                    }).catch(function (err) {
                        res.status(500).send({error: err.message});
                    });
                }).catch(function (err) {
                    res.status(500).send({error: err.message});
                });
            }).catch(function (err) {
                res.status(500).send({error: err.message});
            });
        });

    });

    router.get('/settings', function (req, res) {
        services.settings.getAll().then(function (settings) {
            res.json(settings);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.post('/settings', function (req, res) {
        services.settings.setAll(req.body).then(function () {
            res.json({
                success: true
            });
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.get('/settings/:group', function (req, res) {
        services.settings.getGroup(req.params.group).then(function (settings) {
            res.json(settings);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.get('/settings/:group/:name', function (req, res) {
        services.settings.get(req.params.group, req.params.name).then(function (setting) {
            res.json(setting);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.get('/donations', function (req, res) {
        services.donations.get({
            limit: req.query.limit || 100,
            offset: req.query.offset || 0,
            order: req.query.order || 'desc'
        }).then(function (donations) {
            res.json(donations);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.get('/donations/all', function (req, res) {
        services.donations.getAll({
            order: req.query.order || 'desc'
        }).then(function (donations) {
            res.json(donations);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.post('/donations/test', function (req, res) {
        if (!req.body.test) {
            req.body.test = true;
        }

        global.services.donations.newDonation(req.body).then(function () {
            res.json({success: true});
        }).catch(function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.get('/donations/count', function (req, res) {
        services.donations.count().then(function (count) {
            res.json(count);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.get('/donations/total', function (req, res) {
        services.donations.total().then(function (total) {
            res.json(total);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.get('/followers', function (req, res) {
        services.followers.get({
            limit: req.query.limit || 100,
            offset: req.query.offset || 0,
            order: req.query.order || 'desc'
        }).then(function (followers) {
            res.json(followers);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.get('/followers/all', function (req, res) {
        services.followers.getAll({
            order: req.query.order || 'desc'
        }).then(function (followers) {
            res.json(followers);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.delete('/followers', function (req, res) {
        services.followers.deleteAll().then(function () {
            res.json({
                success: true
            });
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.post('/followers/test', function (req, res) {
        if (!req.body.test) {
            req.body.test = true;
        }

        global.services.followers.newFollower(req.body).then(function () {
            res.json({success: true});
        }).catch(function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.get('/followers/count', function (req, res) {
        services.followers.count().then(function (count) {
            res.json(count);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.head('/followers/user/:user', function (req, res) {
        services.followers.getFollower(req.params.user).then(function () {
            res.status(200).end();
        }, function (err) {
            res.status(err.message === 'That user has never followed the channel before!' ? 404 : 500).end();
        });
    });

    router.get('/followers/user/:user', function (req, res) {
        services.followers.getFollower(req.params.user).then(function (follower) {
            res.json(follower);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.get('/stream', function (req, res) {
        services.stream.getLastStatus().then(function (status) {
            res.json(status);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.post('/stream/game', function (req, res) {
        services.stream.setGame(req.body.game).then(function () {
            res.json({
                success: true
            });
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.post('/stream/title', function (req, res) {
        services.stream.setTitle(req.body.title).then(function () {
            res.json({
                success: true
            });
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.get('/viewers', function (req, res) {
        services.viewers.get({
            limit: req.query.limit || 100,
            offset: req.query.offset || 0,
            order: req.query.order || 'desc'
        }).then(function (donations) {
            res.json(donations);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.get('/viewers/count', function (req, res) {
        services.viewers.getTotalViewers().then(function (count) {
            res.json(count);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.get('/timers', function (req, res) {
        services.timers.getAll().then(function (timers) {
            res.json(timers);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.post('/timers', function (req, res) {
        services.timers.create(req.body.name, req.body.date).then(function (timer) {
            res.json(timer);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.get('/timers/:id', function (req, res) {
        services.timers.get(req.params.id).then(function (timer) {
            res.json(timer);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.delete('/timers/:id', function (req, res) {
        services.timers.remove(req.params.id).then(function () {
            res.json({success: true});
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.post('/timers/:id', function (req, res) {
        services.timers.set(req.params.id, req.body.name, req.body.date).then(function () {
            res.json({success: true});
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.get('/nowplaying/reshow', function (req, res) {
        global.services.socketIOEmit('song-reshow');
        res.status(200).send();
    });

    router.post('/nowplaying/reshow', function (req, res) {
        global.services.socketIOEmit('song-reshow', req.body);
        res.status(200).send();
    });

    router.post('/giantbomb/search/games', function (req, res) {
        global.services.giantBombAPI.searchGames(req.body.title, {
            namesOnly: req.query.namesOnly,
            limit: req.query.limit || 25
        }).then(function (games) {
            res.json(games);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.get('/tools/musicparser/run', function (req, res) {
        global.services.settings.getAll().then(function (settings) {
            let ee = musicInformationParser.run({
                clientID: _.result(_.findWhere(settings, {group: 'soundcloud', name: 'apiKey'}), 'value'),
                ffmpegPath: _.result(_.findWhere(settings, {group: 'directories', name: 'binary'}), 'value') + '/ffmpeg.exe',
                path: _.result(_.findWhere(settings, {group: 'directories', name: 'music'}), 'value'),
                force: req.query.force
            });

            global.services.socketIOEmit('tools-musicparser-started');

            ee.on('info', function (message) {
                global.services.socketIOEmit('tools-musicparser-info', message);
            });

            ee.on('error', function (err) {
                global.services.socketIOEmit('tools-musicparser-error', err.message);
            });

            ee.on('done', function () {
                global.services.socketIOEmit('tools-musicparser-finished');
            });

            res.json({success: true});
        }).catch(function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.get('/scenes/reload', function (req, res) {
        global.services.socketIOEmit('reload-state');
        res.status(200).send();
    });

    router.get('/obs/scene', function (req, res) {
        global.services.obsRemote.getSceneList(function (currentScene, allScenes) {
            res.json(_.findWhere(allScenes, {name: currentScene}));
        });
    });

    router.post('/obs/scene', function (req, res) {
        if (!req.body.name) {
            res.status(500).send({error: 'No name was given!'});
        }

        global.services.obsRemote.setCurrentScene(req.body.name);

        res.status(200).send();
    });

    router.get('/obs/scenes', function (req, res) {
        global.services.obsRemote.getSceneList(function (currentScene, allScenes) {
            res.json(allScenes);
        });
    });

    router.get('/obs/streaming', function (req, res) {
        global.services.obsRemote.getStreamingStatus(function (streaming, preview) {
            res.json({
                streaming,
                preview
            });
        });
    });

    router.get('/obs/status', function (req, res) {
        global.services.obsStatus.getLatest().then(function (status) {
            res.json(status);
        }).catch(function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.get('/obs/statuses', function (req, res) {
        global.services.obsStatus.getAll().then(function (statuses) {
            res.json(statuses);
        }).catch(function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.get('/obs/volumes', function (req, res) {
        global.services.obsRemote.getVolumes(function (microphoneVolume, microphoneMuted, desktopVolume, desktopMuted) {
            res.json({
                microphoneVolume,
                microphoneMuted,
                desktopVolume,
                desktopMuted
            });
        });
    });

    router.get('/chat', function (req, res) {
        global.services.chat.getAll().then(function (data) {
            res.json(data);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.post('/chat/ban', function (req, res) {
        global.services.chat.ban(req.body.username).then(function () {
            res.json({
                success: true
            });
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.post('/chat/timeout', function (req, res) {
        global.services.chat.timeout(req.body.username, req.body.seconds).then(function () {
            res.json({
                success: true
            });
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    router.post('/chat/say', function (req, res) {
        global.services.chat.say(req.body.message).then(function () {
            res.json({
                success: true
            });
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    module.exports = router;
})();