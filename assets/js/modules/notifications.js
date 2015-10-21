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

    let nwNotify = require('nw-notify');

    angular.module('notifications', []);

    angular.module('notifications').provider('Notifications', function () {
        this.options = {
            displayTime: 1
        };

        this.setOptions = function (options) {
            console.log('NotificationsProvider::setOptions()');
            if (!angular.isObject(options)) {
                throw new Error('Options should be an object!');
            }

            this.options = angular.extend({}, this.options, options);
        };

        this.setup = function () {
            // Setup the notifications
            nwNotify.setTemplatePath('notification.html');
            nwNotify.setConfig({
                appIcon: 'assets/image/icon.png',
                displayTime: this.options.displayTime * 1000,
                maxVisibleNotifications: 1
            });
        };

        this.$get = function () {
            let self = this;

            this.setup();

            return {
                setOptions: function (options) {
                    self.setOptions(options);
                },
                notify: function (title, text, sound) {
                    let onShowFunc;

                    if (sound) {
                        onShowFunc = function () {
                            let toPlay = new Howl({
                                urls: [sound.url],
                                volume: sound.volume
                            });

                            toPlay.play();
                        };
                    }

                    nwNotify.notify({
                        title,
                        text,
                        onShowFunc
                    });
                }
            };
        };
    });
})();