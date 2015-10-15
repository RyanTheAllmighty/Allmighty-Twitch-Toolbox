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

process.on('uncaughtException', function (e) {
    console.error(e);
});

var app = require('app');
var BrowserWindow = require('browser-window');
var path = require('path');
var mkdirp = require('mkdirp');
var async = require('async');
var Datastore = require('nedb');

var splashScreen = null;
var mainWindow = null;

app.on('ready', function () {
    splashScreen = new BrowserWindow({width: 576, height: 192, show: false, frame: false, center: true, 'skip-taskbar': true});
    mainWindow = new BrowserWindow({width: 800, height: 500, show: false, center: true, icon: './assets/image/icon.png'});

    global.App = {
        // Setup the base paths
        basePath: path.join(app.getPath('userData'), 'ApplicationStorage'),
        db: {
            test: new Datastore({filename: path.join(app.getPath('userData'), 'ApplicationStorage', 'db', 'test.db'), autoload: true})
        }
    };

    mainWindow.App = global.App;

    splashScreen.loadUrl('file://' + __dirname + '/splash-screen.html');
    splashScreen.show();

    // Make the directories
    async.series([
        function (callback) {
            mkdirp.mkdirp(global.App.basePath, callback);
        }
    ], function () {
        // Close the splash screen
        splashScreen.close();

        mainWindow.loadUrl('file://' + __dirname + '/app.html');
        mainWindow.setMenu(null);
        mainWindow.show();

        mainWindow.webContents.on('new-window', function (event, url) {
            event.preventDefault();

            shell.openExternal(url);
        });

        mainWindow.on('closed', function () {
            mainWindow = null;

            app.quit();
        });
    });
});