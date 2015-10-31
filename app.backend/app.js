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

    let path = require('path');
    let gui = require('nw.gui');
    let Datastore = require('nedb');
    let express = require('express');
    let nwNotify = require('nw-notify');

    let loadingService = require(path.join(process.cwd(), 'assets', 'js', 'services', 'loadingService'));

    let app = express();

    let db = {
        donations: new Datastore({filename: path.join(gui.App.dataPath, 'ApplicationStorage', 'db', 'donations.db'), autoload: true}),
        followers: new Datastore({filename: path.join(gui.App.dataPath, 'ApplicationStorage', 'db', 'followers.db'), autoload: true}),
        settings: new Datastore({filename: path.join(gui.App.dataPath, 'ApplicationStorage', 'db', 'settings.db'), autoload: true}),
        stream: new Datastore({filename: path.join(gui.App.dataPath, 'ApplicationStorage', 'db', 'stream.db'), autoload: true}),
        timers: new Datastore({filename: path.join(gui.App.dataPath, 'ApplicationStorage', 'db', 'timers.db'), autoload: true}),
        viewers: new Datastore({filename: path.join(gui.App.dataPath, 'ApplicationStorage', 'db', 'viewers.db'), autoload: true})

    };

    nwNotify.setTemplatePath('notification.html');
    nwNotify.setConfig({
        appIcon: 'assets/image/icon.png'
    });

    gui.Window.get().on('closed', function () {
        gui.App.clearCache();
        nwNotify.closeAll();
    });

    gui.Window.get().on('new-win-policy', function (frame, url, policy) {
        gui.Shell.openExternal(url);
        policy.ignore();
    });

    global.splashScreen = gui.Window.open('./splash-screen.html', {
        position: 'center',
        width: 500,
        height: 200,
        frame: false,
        toolbar: false,
        show_in_taskbar: false,
        show: false,
        resizable: false
    });

    // Once the splash screen has loaded then we show the window. This prevents the window from showing a blank white window as it loads
    global.splashScreen.on('loaded', function () {
        global.splashScreen.show();
    });

    // When the splash screen is closed, remove it from global
    global.splashScreen.on('closed', function () {
        delete global.splashScreen;
    });

    app.set('port', process.env.PORT || 2323);
    app.use(express.static(process.cwd()));
    app.set('view engine', 'jade');

    app.get('/', function (req, res) {
        res.render(path.join(process.cwd(), 'shell'));
    });

    app.get('/api/test', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            received: true
        }));
    });

    app.listen(5000, function (err) {
        if (err) {
            console.error(err);
        }

        window.location = 'http://localhost:5000';
    });
})();