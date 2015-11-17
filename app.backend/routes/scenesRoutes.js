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

    router.get('/alerts', function (req, res) {
        res.render(path.join(process.cwd(), 'app.scenes', 'alerts'), {
            data: {
                channelHostedNotificationTime: _.result(_.findWhere(req.notificationSettings, {name: 'channelHostedNotificationTime'}), 'value') * 1000,
                donationNotificationTime: _.result(_.findWhere(req.notificationSettings, {name: 'donationNotificationTime'}), 'value') * 1000,
                followerNotificationTime: _.result(_.findWhere(req.notificationSettings, {name: 'followerNotificationTime'}), 'value') * 1000
            }
        });
    });

    router.get('/nowplaying', function (req, res) {
        res.render(path.join(process.cwd(), 'app.scenes', 'nowplaying'), {
            data: {
                musicChangeNotificationTime: _.result(_.findWhere(req.notificationSettings, {name: 'musicChangeNotificationTime'}), 'value') * 1000
            }
        });
    });

    router.get('/timer/:id', function (req, res) {
        global.services.timers.get(req.params.id).then(function (timer) {
            res.render(path.join(process.cwd(), 'app.scenes', 'timer'), {
                data: {timer}
            });
        }).catch(function (err) {
            res.status(500).send({error: err.message});
        });
    });

    module.exports = router;
})();