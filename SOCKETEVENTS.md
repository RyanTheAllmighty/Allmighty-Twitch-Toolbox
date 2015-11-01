# Socket Events
This file contains all the socket events that this application can emit.

**NOTE: This is for advanced users only!**

## Socket Server
The socket server for all these events is on http://localhost:28801.

## new-follower
This event is emitted when someone new has followed the stream. It will only trigger if the user hasn't followed in the past before (meaning they aren't on the Followers list).

This event sends the following data:

```js
{
    "date": "2015-01-17T10:37:59.995Z", // The date that the user followed
    "username": "someuser", // The username of the user who followed
    "display_name": "SomeUser", // The display name of the user who followed
    "test": false, // If this follow was triggered as part of a test (if it's true then it's not a real follow)
}
```

## followers
This event is emitted when the followers list changes. This can be emitted when a new user follows or when an existing user refollows.

This event sends no data.

## follower-count-changed
This event is emitted when the number of followers to your channel changed (both going up and down). This event sends the number of followers the channel now has as per below as an unformatted number:

```js
110003
```

## view-count-changed
This event is emitted when the number of views your channel has changed. This event sends the number of views the channel now has as per below as an unformatted number:

```js
529837
```

## game-updated
This event is emitted when the set game on your channel has changed. This event sends the new game set on your channel as per below:

```js
Minecraft: Story Mode
```

## title-updated
This event is emitted when the title/status on your channel has changed. This event sends the new title set on your channel as per below:

```js
Watch me play games and stuff!
```

## stream-online / stream-offline
This event is emitted when the stream comes online/offline. This event sends the following data:

```js
{
    "followers": 110003, // The number of followers the channel has
    "views": 529837, // The number of views the channel has
    "game": "Minecraft: Story Mode", // The game set on the channel
    "title": "Watch me play games and stuff!", // The title/status of the channel
    "online": true // If the stream is online or not
}
```