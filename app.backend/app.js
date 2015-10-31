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
    let gui = require('nw.gui');
    let express = require('express');
    let nwNotify = require('nw-notify');

    // Add the applications storage dir to the global namespace
    global.applicationStorageDir = path.join(gui.App.dataPath, 'ApplicationStorage');

    // Our Classes
    let Settings = require(path.join(process.cwd(), 'app.backend', 'classes', 'settings'));

    // Our instance variables
    let app = express();
    let settings = new Settings({autoload: true});

    setupMainWindowListeners();
    setupSplashScreen();
    setupExpress();
    setupRoutes();
    startExpress();

    /**
     * This sets up the main window listeners to close the application safely and open up new windows in the users default browser.
     */
    function setupMainWindowListeners() {
        gui.Window.get().on('closed', function () {
            gui.App.clearCache();
            nwNotify.closeAll();
        });

        gui.Window.get().on('new-win-policy', function (frame, url, policy) {
            gui.Shell.openExternal(url);
            policy.ignore();
        });
    }

    /**
     * This sets up the splash screen by creating the window, showing it when loaded and deleting it from the global scope when closed.
     */
    function setupSplashScreen() {
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
    }

    /**
     * This sets up everything related to express such as it's routes, view engine settings etc.
     */
    function setupExpress() {
        app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

        app.set('views', process.cwd());
        app.set('view engine', 'jade');
    }

    /**
     * This sets up the routes for Express.
     */
    function setupRoutes() {
        app.get('/', function (req, res) {
            res.render('shell');
        });

        app.get('/api/settings', function (req, res) {
            settings.getAll().then(function (settings) {
                res.json(settings);
            }, function (err) {
                console.error(err);

                res.status(500).send({error: err.message});
            });
        });

        app.get('/api/settings/:group', function (req, res) {
            settings.getGroup(req.params.group).then(function (settings) {
                res.json(settings);
            }, function (err) {
                console.error(err);

                res.status(500).send({error: err.message});
            });
        });

        app.get('/api/settings/:group/:name', function (req, res) {
            settings.get(req.params.group, req.params.name).then(function (setting) {
                res.json(setting);
            }, function (err) {
                console.error(err);
                res.status(500).send({error: err.message});
            });
        });
    }

    /**
     * This starts the Express server and loads up our Angular app.
     */
    function startExpress() {
        settings.get('network', 'webPort').then(function (port) {
            app.listen(port.value, function (err) {
                if (err) {
                    console.error(err);
                }

                window.location = 'http://localhost:' + port.value;
            });
        }, function (err) {
            console.error(err);
            gui.App.quit();
        });
    }
})();