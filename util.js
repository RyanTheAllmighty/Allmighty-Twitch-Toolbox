/**
 * This is a simple utility file meant to be run with Node to deal with things specific to this application such as packaging for distribution.
 *
 * Below is a list of actions which can be provided and what they do:
 *
 * package - This builds an app.asar in the current directory for distribution with various extra junk removed from the distributed application.
 */

var tmp = require('tmp');
var asar = require('asar');
var del = require('del');
var ncp = require('ncp').ncp;
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
    fs.unlink('./app.asar', function (err) {
        tmp.dir(function (err, path) {
            if (err) {
                return del(path + '/', {force: true}, function () {
                    console.error(err);
                });
            }

            ncp('./', path, function (err) {
                if (err) {
                    return del(path + '/', {force: true}, function () {
                        console.error(err);
                    });
                }

                del([path + '/.git/', path + '/.idea/', path + '/.gitignore', path + '/README.md', path + '/STYLE.md', path + '/util.js'], {force: true, dot: true}, function (err) {
                    if (err) {
                        return del(path + '/', {force: true}, function () {
                            console.error(err);
                        });
                    }

                    asar.createPackage(path, './app.asar', function () {
                        del(path + '/', {force: true});
                    });
                });
            });
        });
    });
}