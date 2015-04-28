/**
 * This is a simple utility file meant to be run with Node to deal with things specific to this application such as packaging for distribution.
 *
 * Below is a list of actions which can be provided and what they do:
 *
 * package - This builds an app.nw in the current directory for distribution with various extra junk removed from the distributed application.
 */

var archiver = require('archiver');
var fs = require('fs');

if (process.argv.length == 2) {
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
        var output = fs.createWriteStream('./app.nw');
        var archive = archiver('zip');

        output.on('close', function () {
            console.log('app.nw created!');
        });

        archive.on('error', function (err) {
            throw err;
        });

        archive.pipe(output);

        archive.bulk([
            {src: ['./**', '!./README.md', '!./STYLE.md', '!./app.nw', '!./util.js'], data: {date: new Date()}}
        ]).finalize();
    });
}