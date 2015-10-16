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

'use strict';

let TwitchAPI = require('twitch-api');

angular.module('twitch', []);

angular.module('twitch').provider('Twitch', function () {
    this.options = {
        accessToken: '',
        clientID: ''
    };

    this.setOptions = function (options) {
        if (!angular.isObject(options)) {
            throw new Error('Options should be an object!');
        }

        this.options = angular.extend({}, this.options, options);
    };

    this.$get = function () {
        return new OurTwitchAPI({
            clientId: this.options.clientID,
            accessToken: this.options.accessToken
        });
    };
});

class OurTwitchAPI extends TwitchAPI {
    constructor(options) {
        super(options);

        this._options = options;
    }

    get accessToken() {
        return this._options.accessToken;
    }
}