Allmighty Twitch Toolbox
====================================

[![Build Status](https://build.atlcdn.net/buildStatus/icon?job=Allmighty Twitch Toolbox)](https://build.atlcdn.net/job/Allmighty%20Twitch%20Toolbox/)

### What is it?
This is a collection of tools and utilities I use for Twitch to tell me such as notifications for new followers and donations as well as providing a simple UI for the broadcaster to use.

### Coding standards & styling guidelines
Please see the STYLE.md file for coding standards and style guidelines.

### Setting up a development environment
To get started you need a couple pieces of software installed on your computer. The versions next to the package is the version we build against so you would be best to get that version or newer:

- [NodeJS](https://nodejs.org/) (4.2.1)
- [Electron](http://electron.atom.io/) (0.34.0)

To make sure you have those all installed correctly, open up a command line/terminal and run the following commands and make sure they all work with no errors:

```javascript
node -v
npm -v
electron -v
```

Once you have those installed on your system you can clone the repository and get started.

#### Building the application
To get started you firstly need to install all the NPM modules needed. Run the below command in the root directory:

```sh
npm install
```

Then, assuming there were no errors, all you need to do is run our util.js file with the package option:

```sh
node util.js package
```

This will create an app.asar file in the current directory.

Alternatively if you just want the latest build binary you can download it from 
[here](https://build.atlcdn.net/job/Allmighty%20Twitch%20Toolbox/)

#### Running the application
To run the application you can simply go into the root directory of the project and run the below command, making sure that Electron is in your PATH:

```sh
electron .
```

Alternatively if you've built the application as said above you can run that with the following command:

```sh
electron app.asar
```

### Getting Started
To get a Twitch API token for use in the application you can either visit http://www.ryandowling.me/twitch-api-token-generator to generate a token using my site or you can follow the directions on Twitch's API docs (https://github.com/justintv/Twitch-API/blob/master/authentication.md) making sure to grant rights for all scopes when doing so.

For details on setup and information about the inbuilt server used and what you can do with it (such as display notifications on your stream), click the Open Server button on the Settings page to be taken to the index page for the inbuilt server.

More instructions to follow

### Attributions
Toolbox icon by Daniel Garrett Hickey

### License
This work is licensed under the GNU General Public License v3.0. To view a copy of this license, visit http://www.gnu.org/licenses/gpl-3.0.txt.
