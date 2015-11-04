# Web Routes
This file contains all the web routes accessible from this application.

**NOTE: This is for advanced users only!**

## URL
The base URL for all these routes is on http://localhost:28800.

## /
This is the main application endpoint and will **NOT** work outside of NWjs, so you won't be able to load this route up in anything except NWjs.

## /api
There routes are the API endpoints and contain routes for CRUD operations on the application.

The return values from all these routes depends on the type of request and will always return JSON:

* GET: Will return the value for the route.
* PUT/POST/DELETE: Will return an object with a property of success which will be true or false.

If an error occurs then a special object will be returned containing an error property which will have a short message about what went wrong like below:

```js
{
    "error": "Something bad happened!"
}
```

You can also check the status code from the request in order to gauge if the request was a success or not.

If everything was a success then a 200 status code will be returned.

If there was an error a 500 status code will be returned.

### GET /api/donations
This route gets a listing of StreamTip donations. It returns the following:

```js
{
    "_total": 345, // The total number of donations in the database
    "_count": 25, // The number of items in the donations array
    "_offset": 0, // The offset provided
    "_order": "desc", // The order the donations are sorted in
    "donations": [
        {
            "date": "2015-01-17T10:37:59.995Z", // The date the donation was made
            "id": "12983987fd37423", // The ID provided by Stream Tip
            "username": "SomeUser", // The username of the user who donated
            "amount": 10, // The amount that was donated
            "note": "This is a donation!" // The note provided (can be null if none was provided)
        }
    ]
}
```

You can specify URL query strings to change the behaviour of the call as per below:

| Name | Description | Default |
| --- | --- | -------- |
| limit | Limits the number of results to return. Maximum is 100. | 25 |
| offset | The number of results to skip. Used in conjunction with limit to paginate between all results | 0 |
| order | Changes the order of the results based upon date. Can be 'asc' or 'desc' | desc |

### GET /api/donations/count
This route gets a count of all the donations made. It returns the following:

```js
25
```

### GET /api/donations/total
This route gets a total of all the donations made. It returns the following:

```js
234.43
```

This isn't formatted in anyway or contain any currency symbols.

### GET /api/followers
This route gets a listing of Twitch followers. It returns the following:

```js
{
    "_total": 345, // The total number of followers in the database
    "_count": 25, // The number of items in the followers array
    "_offset": 0, // The offset provided
    "_order": "desc", // The order the followers are sorted in
    "followers": [
        {
            "date": "2015-01-17T10:37:59.995Z", // The date the user followed
            "id": 3214235, // The Twitch ID of the user
            "username": "someuser", // The username of the user who followed
            "display_name": "SomeUser" // The display name of the user who followed
        }
    ]
}
```

You can specify URL query strings to change the behaviour of the call as per below:

| Name | Description | Default |
| --- | --- | -------- |
| limit | Limits the number of results to return. Maximum is 100. | 25 |
| offset | The number of results to skip. Used in conjunction with limit to paginate between all results | 0 |
| order | Changes the order of the results based upon date. Can be 'asc' or 'desc' | desc |

### GET /api/followers/count
This route gets a count of all the followers. It returns the following:

```js
25
```

### HEAD /api/followers/user/:user
This route checks if a user has followed the channel. The user can be identified by a username or their ID. 

If a user has followed the channel before then it will return a 200 status code else it will return a 404 status code.

### GET /api/followers/user/:user
This route gets the data of a user who has followed the channel. The user can be identified by a username or their ID. It returns the following:

```js
{
    "date": "2015-01-17T10:37:59.995Z", // The date the user followed
    "id": 3214235, // The Twitch ID of the user who followed
    "username": "someuser", // The username of the user who followed
    "display_name": "SomeUser" // The display name of the user who followed
}
```

### POST /api/giantbomb/search/games
This route searches the GiantBomb API for games with the given query. Sent data should be in JSON format via POST as follows:
                                                                                                                                                               
```js
{
    "title": "Minecraft" // The title (or partial title) of the game to search for
}
```

If successful a list of found games will be sent back in the response as per below, else an error will be returned:

```js
[
    "Minecraft",
    "Minecraft: Story Mode"
]
```

You can specify URL query strings to change the behaviour of the call as per below:

| Name | Description | Default |
| --- | --- | -------- |
| limit | Limits the number of results to return. Maximum is 100. | 25 |
| namesOnly | If you only want to return an array of names else it will return an array of game objects from GiantBomb. | false |

### GET /api/nowplaying/reshow
This route sends a message to any displayed now playing scenes to reshow the currently playing song. This will return a 200 status code.

### POST /api/nowplaying/reshow
This route sends a message to any displayed now playing scenes to show the notification with the given information. Sent data should be in JSON format via POST as follows:
                                                                                                                                                               
```js
{
    "title": "Interstellar Rush", // The title of the song
    "artist": "From The Dust", // The name of the artist
    "artwork": "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgM....", // A base64 encoded jpeg of the album art (may not be set)
}
```

This will return a 200 status code.

### GET /api/stream
This route gets the status details about the stream. It returns the following:

```js
{
    "followers": 110003, // The number of followers the channel has
    "views": 529837, // The number of views the channel has
    "game": "Minecraft: Story Mode", // The game set on the channel
    "title": "Watch me play games and stuff!", // The title/status of the channel
    "online": true // If the stream is online or not
}
```

### POST /api/stream/game
This route sets the channels current game. Sent data should be in JSON format via POST as follows:
                                           
```js
{
    game: "Minecraft: Story Mode"
}
```

If successful a success message will be sent back in the response as per below, else an error will be returned:

```js
{
    "success": true
}
```

### POST /api/stream/title
This route sets the channels current title. Sent data should be in JSON format via POST as follows:
                                           
```js
{
    title: "Watch me play games and stuff!"
}
```

If successful a success message will be sent back in the response as per below, else an error will be returned:

```js
{
    "success": true
}
```

### GET /api/settings
This route gets all the settings for the application. It returns an array of values as per below:

```js
[
    {
        "group": "GROUP",
        "name": "NAME",
        "value": "VALUE"
    }
]
```

### POST /api/settings
This route sets the settings for the application. Sent data should be in JSON format via POST as follows:

```js
{
    "notifications": {
        "followerNotificationTime": 10,
        "donationNotificationTime": 10,
        "musicChangeNotificationTime": 5
    }
}
```

The values for the settings are just objects with the group being the name of the object and the properties being the names and values of the settings.

If successful a success message will be sent back in the response as per below, else an error will be returned:

```js
{
    "success": true
}
```

### GET /api/settings/:group
This route gets all the settings for the application within the group specified. It returns an array of values as per below:

```js
[
    {
        "group": "GROUP",
        "name": "NAME",
        "value": "VALUE"
    }
]
```

If there is no group with the given name then an error will be returned.

### GET /api/settings/:group/:name
This route gets all the settings for the application. It returns an object with the setting as per below:

```js
{
    "group": "GROUP",
    "name": "NAME",
    "value": "VALUE"
}
```

If there is no setting found with the given group and name then an error will be returned.

### GET /api/timers
This route returns an array of all the timers. It returns the following:

```js
[ 
    {
      "name": "UntilStart", // The name of the timer
      "date": "2015-10-29T12:25:00.000Z", // The date the timer is set for
      "_id": "nYanqP68aurbExCf" // The ID of the timer
    }
]

### POST /api/timers
This creates a new timer with the given data. Sent data should be in JSON format via POST as follows:
                                                               
```js
{
    "name": "UntilStart", // The name of the timer
    "date": "2015-10-29T12:25:00.000Z", // The date the timer is set for
}
```

If successful the newly created timer will be sent back in the response as per below, else an error will be returned:

```js
{
    "name": "UntilStart", // The name of the timer
    "date": "2015-10-29T12:25:00.000Z", // The date the timer is set for
    "_id": "nYanqP68aurbExCf" // The ID of the timer
}
```

### GET /api/timers/:id
This route returns information about a timer. You can specify it's ID or it's name. It returns the following:

```js
{
    "name": "UntilStart", // The name of the timer
    "date": "2015-10-29T12:25:00.000Z", // The date the timer is set for
    "_id": "nYanqP68aurbExCf" // The ID of the timer
}
```

### POST /api/timers/:id
This sets the timer with the given ID (not name) and sets the date and name of it. Sent data should be in JSON format via POST as follows:
                                                               
```js
{
    "name": "UntilStart", // The name of the timer
    "date": "2015-10-29T12:25:00.000Z" // The date the timer is set for
}
```

If successful the edited timer will be sent back in the response as per below, else an error will be returned:

```js
{
    "name": "UntilStart", // The name of the timer
    "date": "2015-10-29T12:25:00.000Z", // The date the timer is set for
    "_id": "nYanqP68aurbExCf" // The ID of the timer
}
```

### DELETE /api/timers/:id
This route deletes a timer. You can specify it's ID or it's name.

If successful a success message will be sent back in the response as per below, else an error will be returned:

```js
{
    "success": true
}
```

### GET /api/viewers
This route returns an array of viewer objects over time. It returns the following:

```js
{
    "_total": 345, // The total number of viewer objects in the database
    "_count": 25, // The number of items in the viewers array
    "_offset": 0, // The offset provided
    "_order": "desc", // The order the viewers are sorted in
    "viewers": [
        {
            "date": "2015-01-17T10:37:59.995Z", // The date this viewer count corresponds to
            "count": 22 // The number of viewers in the stream
        }
    ]
}
```

You can specify URL query strings to change the behaviour of the call as per below:

| Name | Description | Default |
| --- | --- | -------- |
| limit | Limits the number of results to return. Maximum is 100. | 25 |
| offset | The number of results to skip. Used in conjunction with limit to paginate between all results | 0 |
| order | Changes the order of the results based upon date. Can be 'asc' or 'desc' | desc |

### GET /api/viewers/count
This route returns the number of viewers currently in the stream. It returns the following:

```js
25
```

If the stream is offline then this route will return an error.

### GET /foobar/stop
This route stops foobar.

### GET /foobar/play
This route plays the current song in foobar.

### GET /foobar/pause
This route pauses foobar.

### GET /foobar/previous
This route skips back to the previous song in foobar.

### GET /foobar/next
This route skips to the new song in foobar.

### GET /foobar/nextpause
This route skips to the next song in foobar and pauses.

### GET /foobar/volume
This route changes foobar's volume.

You can specify URL query strings to change the behaviour of the call as per below:

| Name | Description | Default |
| --- | --- | -------- |
| volume | The volume to set foobar to, between -100 and 0 where -100 is muted and 0 is full volume | 0 |

### GET /foobar/state
This returns the current state of foobar including playing song, album art and more.

The return value contains alot of information and isn't mentioned here.