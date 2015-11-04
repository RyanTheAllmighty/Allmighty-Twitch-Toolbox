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

    let gulp = require('gulp');
    let jscs = require('gulp-jscs');
    let jshint = require('gulp-jshint');

    let paths = {
        js: {
            angular: 'app/**/*.js',
            node: 'app.backend/**/*.js',
            scenes: 'app.scenes/js/*.js'
        }
    };

    gulp.task('jshint', function() {
        return gulp.src([paths.js.angular, paths.js.node, paths.js.scenes])
            .pipe(jshint())
            .pipe(jshint.reporter())
            .pipe(jshint.reporter('fail'));
    });

    gulp.task('jscs', function() {
        return gulp.src([paths.js.angular, paths.js.node, paths.js.scenes])
            .pipe(jscs())
            .pipe(jscs.reporter())
            .pipe(jscs.reporter('fail'));
    });

    gulp.task('watch', function() {
        gulp.watch([paths.js.angular, paths.js.node, paths.js.scenes], ['jshint', 'jscs']);
    });

    // The default task (called when you run `gulp` from cli)
    gulp.task('default', ['jshint', 'jscs']);
})();