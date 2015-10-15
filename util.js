/**
 * This is a simple utility file meant to be run with Node to deal with things specific to this application such as packaging for distribution.
 *
 * Below is a list of actions which can be provided and what they do:
 *
 * package - This builds an app.asar in the current directory for distribution with various extra junk removed from the distributed application.
 */

'use strict';

var fs = require('fs');
var archiver = require('archiver');

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

        var output = fs.createWriteStream('./app.nw');
        var archive = archiver('zip');

        archive.on('error', function (err) {
            throw err;
        });

        archive.pipe(output);


        let toArchive = [
            '**',
            '!node_modules/.bin/**',
            '!node_modules/chai/**',
            '!node_modules/grunt/**',
            '!node_modules/grunt-cli/**',
            '!node_modules/grunt-contrib-jshint/**',
            '!node_modules/grunt-mocha-test/**',
            '!node_modules/jshint/**',
            '!node_modules/mocha/**',
            '!node_modules/sinon/**',
            '!.git/**',
            '!.idea/**',
            '!test/**',
            '!.gitignore',
            '!.jshintrc',
            '!.jshintignore',
            '!README.md',
            '!STYLE.md',
            '!util.js',
            '!Gruntfile.js'
        ];

        archive.bulk([
            {src: toArchive, data: {date: new Date()}}
        ]).finalize();
    });
}