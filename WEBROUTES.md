# Web Routes
This file contains all the web routes accessible from this application.

**NOTE: This is for advanced users only!**

## URL
The base URL for all these routes is on http://localhost with the port you've specified in the settings (defaults to 5000).

## /
This is the main application endpoint and will **NOT** work outside of NWjs, so you won't be able to load this route up in anything except NWjs.

## /api
There routes are the API endpoints and contain routes for CRUD operations on the application.

The return values from all these routes depends on the type of request and will always return JSON:

* GET: Will return the value for the route.
* PUT/POST/DELETE: Will return an object with a property of success which will be true or false.

If an error occurs then a special object will be returned containing an error property which will have a short message about what went wrong like below:

```json
{
    "error": "Something bad happened!"
}
```

You can also check the status code from the request in order to guage if the request was a success or not.

If everything was a success then a 200 status code will be returned.

If there was an error a 500 status code will be returned.

### /api/settings
This route gets all the settings for the application. It returns an array of values as per below:

```json
[
    {
        "group": "GROUP",
        "name": "NAME",
        "value": "VALUE"
    }
]
```

### /api/settings/:group
This route gets all the settings for the application within the group specified. It returns an array of values as per below:

```json
[
    {
        "group": "GROUP",
        "name": "NAME",
        "value": "VALUE"
    }
]
```

If there is no group with the given name then an error will be returned.

### /api/settings/:group/:name
This route gets all the settings for the application. It returns an object with the setting as per below:

```json
{
    "group": "GROUP",
    "name": "NAME",
    "value": "VALUE"
}
```

If there is no setting found with the given group and name then an error will be returned.