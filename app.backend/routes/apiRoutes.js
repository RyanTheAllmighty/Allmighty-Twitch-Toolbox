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
    let path = require('path');
    let express = require('express');

    // The Express router
    let router = express.Router();

    // Include our services module
    let services = require(path.join(process.cwd(), 'app.backend', 'services'));

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

    router.get('/timers/:id', function (req, res) {
        services.timers.get(req.params.id).then(function (timer) {
            res.json(timer);
        }, function (err) {
            res.status(500).send({error: err.message});
        });
    });

    module.exports = router;
})();