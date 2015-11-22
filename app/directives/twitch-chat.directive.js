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

/* globals _ */

(function () {
    'use strict';

    angular.module('AllmightyTwitchToolbox').directive('twitchChat', twitchChatDirective);

    twitchChatController.$inject = ['$scope', '$interval', 'Chat', 'SocketIO'];

    function twitchChatController($scope, $interval, Chat, SocketIO) {
        $scope.chat = [];
        $scope.chatMessage = '';

        Chat.getAllMessages().then(function (data) {
            $scope.chat = data;
        });

        SocketIO.on('twitch-chat-message', function (data) {
            $scope.chat.push(data);
        });

        SocketIO.on('twitch-chat-timeout', function (username) {
            $scope.chat = _.map($scope.chat, function (chat) {
                if (chat.user.username === username) {
                    chat.deleted = true;
                }

                return chat;
            });
        });

        $scope.ban = function (username) {
            Chat.ban(username);
        };

        $scope.timeout = function (username) {
            Chat.timeout(username, 300);
        };

        $scope.purge = function (username) {
            Chat.timeout(username, 1);
        };

        $scope.sendMessage = function () {
            Chat.say($scope.chatMessage).then(function () {
                $scope.chatMessage = '';
            });
        };

        // Every 30 seconds trim the chat array down to 100 records
        $interval(function () {
            if ($scope.chat.length > 100) {
                $scope.chat = _.drop($scope.chat, $scope.chat.length - 100);
            }
        }, 30000);
    }

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