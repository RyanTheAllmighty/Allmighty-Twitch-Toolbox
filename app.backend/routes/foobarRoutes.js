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
    let express = require('express');
    let request = require('request');

    // The Express router
    let router = express.Router();

    router.get('/stop', function (req, res) {
        request('http://127.0.0.1:' + req.foobarPort + '/ajquery/?cmd=Stop&param3=NoResponse', function (err, response, body) {
            if (err) {
                return res.status(500).send({error: err.message});
            }

            res.writeHead(response.statusCode);
            res.end(body);
        });
    });

    router.get('/play', function (req, res) {
        request('http://127.0.0.1:' + req.foobarPort + '/ajquery/?cmd=Start&param3=NoResponse', function (err, response, body) {
            if (err) {
                return res.status(500).send({error: err.message});
            }

            res.writeHead(response.statusCode);
            res.end(body);
        });
    });

    router.get('/pause', function (req, res) {
        request('http://127.0.0.1:' + req.foobarPort + '/ajquery/?cmd=PlayOrPause&param3=NoResponse', function (err, response, body) {
            if (err) {
                return res.status(500).send({error: err.message});
            }

            res.writeHead(response.statusCode);
            res.end(body);
        });
    });

    router.get('/previous', function (req, res) {
        request('http://127.0.0.1:' + req.foobarPort + '/ajquery/?cmd=StartPrevious&param3=NoResponse', function (err, response, body) {
            if (err) {
                return res.status(500).send({error: err.message});
            }

            res.writeHead(response.statusCode);
            res.end(body);
        });
    });

    router.get('/next', function (req, res) {
        request('http://127.0.0.1:' + req.foobarPort + '/ajquery/?cmd=StartNext&param3=NoResponse', function (err, response, body) {
            if (err) {
                return res.status(500).send({error: err.message});
            }

            res.writeHead(response.statusCode);
            res.end(body);
        });
    });

    router.get('/nextpause', function (req, res) {
        request('http://127.0.0.1:' + req.foobarPort + '/ajquery/?cmd=StartNext&param3=NoResponse', function (err, response, body) {
            if (err) {
                return res.status(500).send({error: err.message});
            }

            request('http://127.0.0.1:' + req.foobarPort + '/ajquery/?cmd=PlayOrPause&param3=NoResponse', function (err, response, body) {
                if (err) {
                    return res.status(500).send({error: err.message});
                }

                res.writeHead(response.statusCode);
                res.end(body);
            });
        });
    });

    router.get('/volume', function (req, res) {
        request('http://127.0.0.1:' + req.foobarPort + '/ajquery/?cmd=VolumeDB&param1=' + req.query.level || 0 + '&param3=NoResponse', function (err, response, body) {
            if (err) {
                return res.status(500).send({error: err.message});
            }

            res.writeHead(response.statusCode);
            res.end(body);
        });
    });

    router.get('/state', function (req, res) {
        request.get({url: 'http://127.0.0.1:' + req.foobarPort + '/ajquery/?param3=js/state.json', json: true}, function (err, response, body) {
            if (err) {
                return res.status(500).send({error: err.message});
            }

            request.get({url: 'http://127.0.0.1:' + req.foobarPort + body.albumArt, json: true, encoding: null}, function (err2, response2, body2) {
                if (err2) {
                    return res.status(500).send({error: err2.message});
                }

                body.albumArt = body2.toString('base64');
                res.send(JSON.stringify(body));
            });
        });
    });

    module.exports = router;
})();