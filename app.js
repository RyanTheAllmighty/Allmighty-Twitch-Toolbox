process.on("uncaughtException", function (e) {
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
        },
        function (callback) {
            mkdirp.mkdirp(global.App.filesPath, callback);
        },
        function (callback) {
            mkdirp.mkdirp(global.App.instancesPath, callback);
        },
        function (callback) {
            mkdirp.mkdirp(global.App.skinsPath, callback);
        },
        function (callback) {
            mkdirp.mkdirp(global.App.downloadsPath, callback);
        },
        function (callback) {
            mkdirp.mkdirp(global.App.librariesPath, callback);
        }
    ], function () {
        // Load everything
        loadingService.load(function (err) {
            if (err) {
                console.error(err);
                splashScreen.close();
                return app.quit();
            }

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
});