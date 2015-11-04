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
    let async = require('async');
    let mkdirp = require('mkdirp');
    let rimraf = require('rimraf');
    let jscs = require('gulp-jscs');
    let archiver = require('archiver');
    let jshint = require('gulp-jshint');
    let NwBuilder = require('nw-builder');
    let packageJson = require('./package.json');

    // Replace the package.json's name with a readable one
    packageJson.name = packageJson.name.replace(/-/g, ' ');

    let toArchive = [
        '**',
        '!node_modules/.bin/**',
        '!node_modules/chai/**',
        '!node_modules/gulp/**',
        '!node_modules/gulp-jscs/**',
        '!node_modules/gulp-jshint/**',
        '!node_modules/mkdirp/**',
        '!node_modules/mocha/**',
        '!node_modules/nw-builder/**',
        '!node_modules/rimraf/**',
        '!node_modules/sinon/**',
        '!node_modules/ffmetadata/test/**',
        '!.git/**',
        '!.idea/**',
        '!build/**',
        '!dist/**',
        '!dist-cache/**',
        '!test/**',
        '!.gitignore',
        '!.jscsrc',
        '!.jshintrc',
        '!.jshintignore',
        '!README.md',
        '!SOCKETEVENTS.md',
        '!STYLE.md',
        '!WEBROUTES.md',
        '!gulpfile.js',
        '!app.nw',
        '!npm-debug.log'
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

    gulp.task('clean-dist', function (cb) {
        rimraf('./dist', function (err) {
            if (err) {
                return cb(err);
            }

            mkdirp('./dist/' + packageJson.name + ' v' + packageJson.version + '/', cb);
        });
    });

    gulp.task('package', ['clean-dist'], function (cb) {
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
            {src: toArchive, data: {date: new Date()}}
        ]).finalize();
    });

    gulp.task('distribute', ['clean-dist', 'package'], function (cb) {
        let nw = new NwBuilder({
            files: toArchive,
            version: packageJson.nwJSVersion,
            appName: packageJson.name,
            platforms: ['win', 'osx', 'linux'],
            buildDir: './dist',
            cacheDir: './dist-cache',
            macIcns: './assets/image/icon.icns',
            winIco: './assets/image/icon.ico',
            buildType: function () {
                return this.appName + ' v' + this.appVersion;
            }
        });

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