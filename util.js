/**
 * This is a simple utility file meant to be run with Node to deal with things specific to this application such as packaging for distribution.
 *
 * Below is a list of actions which can be provided and what they do:
 *
 * package - This builds an app.asar in the current directory for distribution with various extra junk removed from the distributed application.
 */

'use strict';

var fs = require('fs');
var del = require('del');
var tmp = require('tmp');
var asar = require('asar');
var path = require('path');
var ncp = require('ncp').ncp;

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
    fs.unlink('./app.asar', function (err) {
        if (err && fs.existsSync('./app.asar')) {
            return console.error(err);
        }

        tmp.dir(function (err, tempPath) {
            console.log(tempPath);
            if (err) {
                del(tempPath + '/', {force: true}).then(function () {
                    console.error(err);
                });
            } else {
                ncp('./', tempPath, function (err) {
                    if (err) {
                        del(tempPath + '/', {force: true}).then(function () {
                            console.error(err);
                        });
                    } else {
                        let thingsToDelete = [
                            tempPath + '/node_modules/.bin/',
                            tempPath + '/node_modules/chai/',
                            tempPath + '/node_modules/grunt/',
                            tempPath + '/node_modules/grunt-cli/',
                            tempPath + '/node_modules/grunt-contrib-jshint/',
                            tempPath + '/node_modules/grunt-mocha-test/',
                            tempPath + '/node_modules/jshint/',
                            tempPath + '/node_modules/mocha/',
                            tempPath + '/node_modules/sinon/',
                            tempPath + '/.git/',
                            tempPath + '/.idea/',
                            tempPath + '/test/',
                            tempPath + '/.gitignore',
                            tempPath + '/.jshintrc',
                            tempPath + '/.jshintignore',
                            tempPath + '/README.md',
                            tempPath + '/STYLE.md',
                            tempPath + '/util.js',
                            tempPath + '/Gruntfile.js'
                        ];

                        del(thingsToDelete, {force: true, dot: true}).then(function () {
                            console.log('Packaging up application!');
                            console.log(path.resolve('./app.asar'));
                            asar.createPackage(tempPath, './app.asar', function () {
                                del(tempPath + '/', {force: true}).then(function () {
                                    console.log('Application packaged successfully!');
                                });
                            });
                        });
                    }
                });
            }
        });
    });
}