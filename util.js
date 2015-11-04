/**
 * This is a simple utility file meant to be run with Node to deal with things specific to this application such as packaging for distribution.
 *
 * Below is a list of actions which can be provided and what they do:
 *
 * package - This builds an app.nw in the current directory for distribution with letious extra junk removed from the distributed application.
 */

(function () {
    'use strict';

    let fs = require('fs');
    let archiver = require('archiver');

    if (process.argv.length === 2) {
        console.error('No argument provided!');
        process.exit(1);
    }

    switch (process.argv[2]) {
        case 'package':
            packageApp();
            break;
        default:
            console.error('Invalid action provided!');
            process.exit(1);
            break;
    }

    function packageApp() {
        fs.unlink('./app.nw', function (err) {
            if (err && fs.existsSync('./app.nw')) {
                return console.error(err);
            }

            let output = fs.createWriteStream('./app.nw');
            let archive = archiver('zip');

            archive.on('error', function (err) {
                throw err;
            });

            archive.pipe(output);

            let toArchive = [
                '**',
                '!node_modules/.bin/**',
                '!node_modules/chai/**',
                '!node_modules/gulp/**',
                '!node_modules/gulp-jscs/**',
                '!node_modules/gulp-jshint/**',
                '!node_modules/mocha/**',
                '!node_modules/sinon/**',
                '!node_modules/ffmetadata/test/**',
                '!.git/**',
                '!.idea/**',
                '!test/**',
                '!.gitignore',
                '!.jscsrc',
                '!.jshintrc',
                '!.jshintignore',
                '!README.md',
                '!SOCKETEVENTS.md',
                '!STYLE.md',
                '!WEBROUTES.md',
                '!util.js',
                '!gulpfile.js',
                '!app.nw',
                '!npm-debug.log'
            ];

            archive.bulk([
                {src: toArchive, data: {date: new Date()}}
            ]).finalize();
        });
    }
})();