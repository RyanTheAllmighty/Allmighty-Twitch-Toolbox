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

/* globals request */

'use strict';

angular.module('streamtip', []);

angular.module('streamtip').provider('StreamTip', function () {
    this.options = {
        clientId: '',
        accessToken: ''
    };

    this.setOptions = function (options) {
        if (!angular.isObject(options)) {
            throw new Error('Options should be an object!');
        }

        this.options = angular.extend({}, this.options, options);
    };

    this.$get = function () {
        return new StreamTipAPI(this.options);
    };
});

class StreamTipAPI {
    constructor(options) {
        this._options = options;
    }

    getTips(options, callback) {
        if (!callback) {
            callback = options;
            options = {
                limit: 25
            };
        }

        let queryString = '?';

        if (options.limit) {
            queryString += 'limit=' + options.limit;
        }

        request.get({
            url: 'https://streamtip.com/api/tips' + queryString,
            json: true,
            headers: {
                'Authorization': global.App.settings.streamtip.clientID + ' ' + global.App.settings.streamtip.accessToken
            }
        }, function (err, res, body) {
            if (err) {
                return callback(err);
            }

            callback(null, body);
        });
    }
}