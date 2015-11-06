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
    let gui = global.window.nwDispatcher.requireNwGui();
    let nwNotify = require('nw-notify');

    // Include our services module
    let services = require(path.join(process.cwd(), 'app.backend', 'services'));
    global.services = services;

    // Add the applications storage dir to the global namespace
    global.applicationStorageDir = path.join(gui.App.dataPath, 'ApplicationStorage');

    // When the main window is closed, make sure to do some cleaning up
    gui.Window.get().on('closed', function () {
        gui.App.clearCache();
        nwNotify.closeAll();
    });

    // When a new window is opened, open it in the users default browser
    gui.Window.get().on('new-win-policy', function (frame, url, policy) {
        gui.Shell.openExternal(url);
        policy.ignore();
    });

    nwNotify.setConfig({
        appIcon: path.join(process.cwd(), 'assets', 'image', 'icon.png')
    });

    // Load everything up
    services.load()
        .then(services.showSplashScreen)
        .then(services.setupOBSRemote)
        .then(services.setupTwitchAPI)
        .then(services.setupStreamTipAPI)
        .then(services.setupGiantBombAPI)
        .then(services.startNotificationQueue)
        .then(services.startFollowerChecker)
        .then(services.startDonationChecker)
        .then(services.startStreamChecker)
        .then(services.startMusicChecker)
        .then(services.setupSocketIOServer)
        .then(services.setupExpress)
        .then(services.startExpressServer)
        .then(services.loadAngularApp)
        .catch(function (err) {
            console.error(err);
            gui.App.quit();
        });
})();