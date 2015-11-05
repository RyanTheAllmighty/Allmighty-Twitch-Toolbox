Allmighty Twitch Toolbox
====================================

[![Build Status](https://build.atlcdn.net/buildStatus/icon?job=Allmighty Twitch Toolbox)](https://build.atlcdn.net/job/Allmighty%20Twitch%20Toolbox/)

### What is it?
This is a collection of tools and utilities I use for Twitch to tell me such as notifications for new followers and donations as well as providing a simple UI for the broadcaster to use.

### Coding standards & styling guidelines
Please see the STYLE.md file for coding standards and style guidelines.

### Requirements
In order to run the application you'll need to install the following programs on your computer. The versions next to the package is the version we build against so you would be best to get that
version or newer:

- [NodeJS](https://nodejs.org/) (4.2.2)
- [NW.js](http://nwjs.io/) (0.12.3)
- [Gulp](http://gulpjs.com/) (3.9.0) (Install via 'npm install -g gulp')

This project uses ES6 features, so a version of NodeJS is required to support the ES6 features we use. Using the listed NodeJS version listed above or newer is most likely the best move. We recommend
using [NVM](https://github.com/creationix/nvm) to manage and use specific NodeJS versions on your system.

To make sure you have those all installed correctly, open up a command line/terminal and run the following commands and make sure they all work with no errors:

```javascript
node -v
npm -v
nw -v
gulp -v
```

Once you have those installed on your system you can clone the repository and get started.

#### Building the application
To get started you firstly need to install all the NPM modules needed. Run the below command in the root directory:

```sh
npm install
```

Then, assuming there were no errors, all you need to do is run the package gulp task to generate a packaged nw file:

```sh
gulp package
```

This will create an app.nw file in the 'dist/{Application Name} v{Application Version}/' folder.

If you want to create executable for every platform then you can run the following:

```sh
gulp distribute
```

Which will create all the necessary zip files (and .nw file) in the 'dist/{Application Name} v{Application Version}/' folder.

Please note that to create distributable files with the distribute gulp task, you'll need a Windows machine with .net 2.0 or if you're on Linux/OSX then you'll need Wine with .net 2.0 installed and a
X server installed (Xvfb works well for servers). You can also skip the need to have .net and Wine for OSX/Linux by passing in the option skipWinIcon like below:

```sh
gulp distribute --skipWinIcon
```

Alternatively if you just want the latest binary build you can download it from [here](https://build.atlcdn.net/job/Allmighty%20Twitch%20Toolbox/) but please note that while we try to stay away from
native modules as much as possible, you may need to build your own binary to work on your system.

#### Running the application
To run the application you can simply go into the root directory of the project and run the below command, making sure that NW.js is in your PATH:

```sh
nw .
```

Alternatively if you've built the application as said above you can run that with the following command:

```sh
nw *.nw
```

But please be aware that running from a packaged application will cause some slowdown on initial load as it unpacks the application ready to start loading.

### Getting Started
More instructions to follow

### Attributions
Toolbox icon by Daniel Garrett Hickey

### License
This work is licensed under the GNU General Public License v3.0. To view a copy of this license, visit http://www.gnu.org/licenses/gpl-3.0.txt.