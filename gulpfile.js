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

    let fs = require('fs');
    let gulp = require('gulp');
    let path = require('path');
    let async = require('async');
    let mkdirp = require('mkdirp');
    let rimraf = require('rimraf');
    let jscs = require('gulp-jscs');
    let copyDir = require('copy-dir');
    let archiver = require('archiver');
    let minimist = require('minimist');
    let jshint = require('gulp-jshint');
    let child = require('child_process');
    let NwBuilder = require('nw-builder');
    let packageJson = require('./package.json');

    let options = minimist(process.argv.slice(2));

    // Replace the package.json's name with a readable one
    packageJson.name = packageJson.name.replace(/-/g, ' ');

    let excludedFolders = [
        '.git',
        '.idea',
        'build',
        'dist',
        'dist-cache',
        'test'
    ];

    let paths = {
        js: {
            angular: 'app/**/*.js',
            node: 'app.backend/**/*.js',
            scenes: 'app.scenes/js/*.js',
            misc: '*.js'
        }
    };

    gulp.task('jshint', function () {
        return gulp.src([paths.js.angular, paths.js.node, paths.js.scenes, paths.js.misc])
            .pipe(jshint())
            .pipe(jshint.reporter())
            .pipe(jshint.reporter('fail'));
    });

    gulp.task('jscs', function () {
        return gulp.src([paths.js.angular, paths.js.node, paths.js.scenes, paths.js.misc])
            .pipe(jscs())
            .pipe(jscs.reporter())
            .pipe(jscs.reporter('fail'));
    });

    gulp.task('watch', function () {
        gulp.watch([paths.js.angular, paths.js.node, paths.js.scenes, paths.js.misc], ['jshint', 'jscs']);
        gulp.start('default');
    });

    gulp.task('clean-build', function (cb) {
        rimraf('./build', function (err) {
            if (err) {
                return cb(err);
            }

            mkdirp('./build', function (err) {
                if (err) {
                    return cb(err);
                }

                copyDir.sync('./', './build/', function (_stat, _path) {
                    if (_stat !== 'directory') {
                        return true;
                    }

                    return excludedFolders.indexOf(_path) === -1;
                });

                child.exec('npm prune --production', {cwd: path.join(__dirname, 'build')}, cb);
            });
        });
    });

    gulp.task('clean-dist', function (cb) {
        rimraf('./dist', function (err) {
            if (err) {
                return cb(err);
            }

            mkdirp('./dist/' + packageJson.name + ' v' + packageJson.version + '/', cb);
        });
    });

    gulp.task('package', ['clean-build', 'clean-dist'], function (cb) {
        let filePath = './dist/' + packageJson.name + ' v' + packageJson.version + '/' + packageJson.name + ' v' + packageJson.version + '.nw';
        let output = fs.createWriteStream(filePath);
        let archive = archiver('zip');

        archive.on('error', function (err) {
            cb(err);
        });

        archive.on('finish', function () {
            cb();
        });

        archive.pipe(output);

        archive.bulk([
            {src: './build/**', data: {date: new Date()}}
        ]).finalize();
    });

    gulp.task('distribute', ['clean-build', 'clean-dist'], function (cb) {
        let nwOpts = {
            files: './build/**',
            version: packageJson.nwJSVersion,
            appName: packageJson.name,
            platforms: ['win', 'osx', 'linux'],
            buildDir: './dist',
            cacheDir: './dist-cache',
            macIcns: './assets/image/icon.icns',
            winIco: './assets/image/icon.ico',
            zip: false,
            buildType: function () {
                return this.appName + ' v' + this.appVersion;
            }
        };

        if (options.skipWinIcon) {
            delete nwOpts.winIco;
        }

        let nw = new NwBuilder(nwOpts);

        nw.build().then(function () {
            async.each(['linux32', 'linux64', 'osx32', 'osx64', 'win32', 'win64'], function (dist, next) {
                let folder = './dist/' + packageJson.name + ' v' + packageJson.version + '/' + dist + '/';
                let finalZip = './dist/' + packageJson.name + ' v' + packageJson.version + '/' + packageJson.name + ' v' + packageJson.version + ' - ' + dist + '.zip';

                let output = fs.createWriteStream(finalZip);
                let archive = archiver('zip');

                archive.on('error', function (err) {
                    next(err);
                });

                archive.on('finish', function () {
                    rimraf(folder, next);
                });

                archive.pipe(output);

                archive.directory(folder, false, {date: new Date()}).finalize();
            }, function (err) {
                if (err) {
                    return cb(err);
                }

                return cb();
            });
        }).catch(function (error) {
            cb(error);
        });
    });

    // The default task (called when you run `gulp` from cli)
    gulp.task('default', ['jshint', 'jscs']);
})();