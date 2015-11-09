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

/* globals _, irc */

(function () {
    'use strict';

    angular.module('AllmightyTwitchToolbox').directive('twitchChat', twitchChatDirective);

    let twitchChatController = ['$scope', '$interval', function ($scope, $interval) {
        $scope.chat = [];
        $scope.chatMessage = '';

        let client = new irc.client({
            connection: {
                random: 'chat',
                reconnect: true
            },
            identity: {
                username: $scope.channel,
                password: $scope.oauth
            },
            channels: ['#' + $scope.channel]
        });

        client.connect();

        client.on('chat', function (channel, user, message) {
            console.log(user);
            if (user.emotes) {
                _.forEach(user.emotes, function (locations, key) {
                    let emoteURL = 'http://static-cdn.jtvnw.net/emoticons/v1/' + key + '/3.0';

                    _.forEach(locations, function (location) {
                        let locationParts = location.split('-');

                        message = message.substr(0, parseInt(locationParts[0])) + '<img class="twitch-chat-emoticon" src="' + emoteURL + '" />' + message.substring(parseInt(locationParts[1]) + 1);
                    });
                });
            }

            $scope.chat.push({
                date: new Date(),
                user,
                message: message
            });
        });

        client.on('timeout', function (channel, username) {
            $scope.chat = _.map($scope.chat, function (chat) {
                if (chat.user.username === username) {
                    chat.message = '<Deleted>';
                }

                return chat;
            });
        });

        $scope.ban = function (username) {
            client.ban($scope.channel, username);
        };

        $scope.timeout = function (username) {
            client.timeout($scope.channel, username, 300);
        };

        $scope.purge = function (username) {
            client.timeout($scope.channel, username, 1);
        };

        $scope.sendMessage = function () {
            if ($scope.chatMessage) {
                client.say($scope.channel, $scope.chatMessage);
                $scope.chatMessage = '';
            }
        };

        // Every 30 seconds trim the chat array down to 100 records
        $interval(function () {
            if ($scope.chat.length > 100) {
                $scope.chat = _.drop($scope.chat, $scope.chat.length - 100);
            }
        }, 30000);
    }];

    function twitchChatDirective() {
        return {
            restrict: 'E',
            scope: {
                channel: '=',
                oauth: '='
            },
            templateUrl: 'app/directives/twitch-chat.directive.html',
            replace: true,
            controller: twitchChatController
        };
    }
})();