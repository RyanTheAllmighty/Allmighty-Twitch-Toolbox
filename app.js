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

var app = require('app');
var path = require('path');
var shell = require('shell');
var Datastore = require('nedb');
var mkdirp = require('mkdirp').mkdirp;
var BrowserWindow = require('browser-window');

let loadingService = require('./assets/js/services/loadingService');

var mainWindow = null;

process.on('uncaughtException', function (e) {
    console.error(e);
});

app.on('ready', function () {
    mainWindow = new BrowserWindow({width: 800, height: 500, show: false, center: true, icon: './assets/image/icon.png'});

    /**
     *
     * @type {{basePath: (String), db: {donations: (Datastore), followers: (Datastore), settings: (Datastore)}, settings: (Object)}}
     */
    global.App = {
        // Setup the base path
        basePath: path.join(app.getPath('userData'), 'ApplicationStorage'),
        db: {
            donations: new Datastore({filename: path.join(app.getPath('userData'), 'ApplicationStorage', 'db', 'donations.db'), autoload: true}),
            followers: new Datastore({filename: path.join(app.getPath('userData'), 'ApplicationStorage', 'db', 'followers.db'), autoload: true}),
            settings: new Datastore({filename: path.join(app.getPath('userData'), 'ApplicationStorage', 'db', 'settings.db'), autoload: true})
        },
        settings: {}
    };

    mainWindow.App = global.App;

    // Make the main directory
    loadingService.load(function (err) {
        if (err) {
            console.error(err);
        }

        mainWindow.loadUrl('file://' + __dirname + '/app.html');
        mainWindow.setMenu(null);
        mainWindow.show();
        mainWindow.openDevTools({
            detach: true
        });

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