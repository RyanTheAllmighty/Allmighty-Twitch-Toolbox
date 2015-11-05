# Socket Events
This file contains all the socket events that this application can emit.

**NOTE: This is for advanced users only!**

## Socket Server
The socket server for all these events is on http://localhost:28800.

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

## viewer-count-changed
This event is emitted when the number of viewers currently on your live channel has changed. This event sends the number of viewers in the stream now as per below as an unformatted number:

```js
1458
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

## timer-added
This event is emitted when a new timer has been added. This event sends the following data:

```js
{
    "name": "UntilStart", // The name of the timer
    "date": "2015-10-29T12:25:00.000Z", // The date the timer is set for
    "_id": "nYanqP68aurbExCf" // The ID of the timer
}
```

## timer-deleted
This event is emitted when a timer has been deleted. This event sends the following data:

```js
{
    "_id": "nYanqP68aurbExCf", // The id of the timer
    "name": "UntilStart" // The name of the timer (may not be present if there is no name set for the timer)
}
```

## timer-set
This event is emitted when a timer has been set. This event sends the following data:

```js
{
    "_id": "nYanqP68aurbExCf", // The id of the timer
    "name": "UntilStart", // The name of the timer (may not be present if there is no name set for the timer)
    "date": "2015-10-29T12:25:00.000Z" // The date the timer is set for
}
```

## song-changed
This event is emitted when the song playing has changed. This event sends the following data:

```js
{
    "title": "Interstellar Rush", // The title of the song
    "artist": "From The Dust", // The name of the artist
    "artwork": "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgM....", // A base64 encoded jpeg of the album art (may not be set)
    "websites": {
        "artist": "http://soundcloud.com/ftdmusic", // The artists webpage (may not be set)
        "song": "http://soundcloud.com/ftdmusic/from-the-dust-interstellar-rush-free" // The songs webpage (may not be set)
    }
}
```

## song-reshow
This event is emitted when something is requesting that the currently playing song be reshowed. This event CAN send the following data, but can also be empty:

```js
{
    "title": "Interstellar Rush", // The title of the song
    "artist": "From The Dust", // The name of the artist
    "artwork": "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgM...." // A base64 encoded jpeg of the album art (may not be set)
}
```

## play-sound
This event is emitted when something is requesting that a sound should be played. This event will send the following data:

```js
{
    "data": "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgM....", // A base64 encoded string of the sound to play
    "volume": 1 // The volume to play the sound at. Between 0 and 1 where 0 is silent and 1 is not silent. This MAY not be present, if not present then assume a volume of 1.
}
```

Due to not being able to run sounds through NodeJS easily, and to keep things separate so Angular can be run without the context of NWjs, this is necessary in order to play sounds for alerts.

## tools-musicparser-started
This event is emitted when the music parser has started. This event sends no information.

## tools-musicparser-finished
This event is emitted when the music parser has finished successfully. This event sends no information.

## tools-musicparser-info
This event is emitted when the music parser has returned some information. This event will send the following data:

```js
"Some message"
```

## tools-musicparser-error
This event is emitted when the music parser has returned an error and has finished. This event will send the following data:

```js
"Some error message"
```