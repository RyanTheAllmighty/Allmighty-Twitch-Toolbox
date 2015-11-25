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
    let fs = require('fs');
    let path = require('path');
    let nwNotify = require('nw-notify');
    let gui = global.window.nwDispatcher.requireNwGui();

    // Command line arguments
    global.args = require('minimist')(gui.App.argv);

    // Include our services module
    let services = require(path.join(process.cwd(), 'app.backend', 'services'));
    global.services = services;

    // Add the applications storage dir to the global namespace
    global.applicationStorageDir = path.join(gui.App.dataPath, 'ApplicationStorage');

    // Check for a custom set storage dir
    if (global.args.storageDir && fs.existsSync(global.args.storageDir)) {
        console.log('Custom storage dir set to', global.args.storageDir);
        
        global.applicationStorageDir = global.args.storageDir;
    }

    // When the main window is closed, remove the tray (if there) and do some cleaning up
    gui.Window.get().on('closed', function () {
        if (global.services.tray.main) {
            global.services.tray.main.remove();
        }

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
        .then(services.setupComponents)
        .then(services.startCheckers)
        .then(services.startComponents)
        .then(services.loadAngularApp)
        .catch(function (err) {
            console.log('Error starting application! Please see the messages in this console and close the console when done!');
            console.error(err);

            services.splashScreen.showDevTools();
            services.splashScreen.on('devtools-closed', function () {
                gui.App.quit();
            });
        });
})();