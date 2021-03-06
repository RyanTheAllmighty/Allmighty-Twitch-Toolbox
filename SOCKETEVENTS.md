# Socket Events
This file contains all the socket events that this application can emit.

**NOTE: This is for advanced users only!**



<!-- toc -->

* [Socket Server](#socket-server)
* [new-follower](#new-follower)
* [followers](#followers)
* [follower-count-changed](#follower-count-changed)
* [view-count-changed](#view-count-changed)
* [viewer-count-changed](#viewer-count-changed)
* [game-updated](#game-updated)
* [title-updated](#title-updated)
* [stream-online / stream-offline](#stream-online-stream-offline)
* [timer-added](#timer-added)
* [timer-deleted](#timer-deleted)
* [timer-set](#timer-set)
* [song-changed](#song-changed)
* [song-reshow](#song-reshow)
* [play-sound](#play-sound)
* [tools-musicparser-started](#tools-musicparser-started)
* [tools-musicparser-finished](#tools-musicparser-finished)
* [tools-musicparser-info](#tools-musicparser-info)
* [tools-musicparser-error](#tools-musicparser-error)
* [obs-scene-switched](#obs-scene-switched)
* [obs-stream-started](#obs-stream-started)
* [obs-stream-stopped](#obs-stream-stopped)
* [obs-status-changed](#obs-status-changed)
* [obs-microphone-volume-changed](#obs-microphone-volume-changed)
* [obs-desktop-volume-changed](#obs-desktop-volume-changed)
* [twitch-chat-cleared](#twitch-chat-cleared)
* [twitch-chat-message](#twitch-chat-message)
* [twitch-chat-slowmode](#twitch-chat-slowmode)
* [twitch-chat-submode](#twitch-chat-submode)
* [twitch-chat-timeout](#twitch-chat-timeout)
* [channel-hosted](#channel-hosted)

<!-- toc stop -->



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

## obs-scene-switched
This event is emitted when the current scene in OBS is switched to another one. This event will send the following data:

```js
{
    "name": "Scene", // The name of the scene in OBS
    "sources": [ // An array of all the sources in this scene
        {
            "width": 500, // The width of this source
            "height": 125, // The height of this source
            "x": 390, // The x position of this source
            "y": 0, // The y position of this source
            "name": "Start Timer", // The name of this source
            "rendered": true // If this source is enabled or not
        }
    ]
}
```

## obs-stream-started
This event is emitted when OBS starts streaming, recording or enters preview mode. This event will send the following data:

```js
{
    "preview": false // If we're in preview mode or not
}
```

## obs-stream-stopped
This event is emitted when OBS stops streaming, recording or exits preview mode. This event will send the following data:

```js
{
    "preview": false // If we we're in preview mode or not
}
```

## obs-status-changed
This event is emitted when OBS reports it's status. This event will send the following data:

```js
{
    "streaming": true,
    "previewing": true,
    "bytesPerSecond": 454285,
    "strain": 0,
    "streamDurationInMS": 900990,
    "totalFrames": 96121,
    "droppedFrames": 0,
    "framesPerSecond": 60,
    "date": "2015-01-17T10:37:59.995Z"
}
```

## obs-microphone-volume-changed
This event is emitted when the microphones volume is changed. This event will send the following data:

```js
{
    "volume": 0, // This value is between 0 and 1 where 0 is muted and 1 is full volume
    "muted": true // If the microphone is muted or not
}
```

Please be aware that if you use the Per-Scene Volume Plugin then switching between scenes with different levels will still send off this event.

## obs-desktop-volume-changed
This event is emitted when the desktop volume is changed. This event will send the following data:

```js
{
    "volume": 0, // This value is between 0 and 1 where 0 is muted and 1 is full volume
    "muted": true // If the desktop volume is muted or not
}
```

Please be aware that if you use the Per-Scene Volume Plugin then switching between scenes with different levels will still send off this event.

## twitch-chat-cleared
This event is emitted when the chat has been cleared. This event doesn't send any information.

## twitch-chat-message
This event is emitted when a new Twitch chat message has been received. This event will send the following data:

```js
{
    "user": {
        
    },
    "message": "Hello <img class=\"twitch-chat-emoticon\" src=\"http://static-cdn.jtvnw.net/emoticons/v1/25/3.0\" />", // The message with the emotes parsed into img tags
    "rawMessage": "Hello Kappa", // The raw message without any emote parsing
    "date": "2015-01-17T10:37:59.995Z" // The date the message was received
}
```

## twitch-chat-slowmode
This event is emitted when the channel enters or exits slow mode. This event will send the following data:

```js
{
    "enabled": true, // If slow mode is enabled or not
    "length": 30 // The number of seconds users can send messages
}
```

## twitch-chat-submode
This event is emitted when the channel enters or exits subscribers only mode. This event will send the following data:

```js
{
    "enabled": true // If subscribers only mode is enabled or not
}
```

## twitch-chat-timeout
This event is emitted when a user has been timed out. This event will send the following data:

```js
"SomeUser" // The username of the user who was timed out
```

## channel-hosted
This event is emitted when a user has hosted your channel. This event will send the following data:

```js
{
    "username": SomeUser", // The username of the user who hosted you
    "viewers": 22 // The number of viewers the host was for
}
```