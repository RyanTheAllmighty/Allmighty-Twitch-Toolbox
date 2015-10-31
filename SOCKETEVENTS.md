# Socket Events
This file contains all the socket events that this application can emit.

**NOTE: This is for advanced users only!**

## Socket Server
The socket server for all these events is on http://localhost with the port you've specified in the settings (defaults to 4000).

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