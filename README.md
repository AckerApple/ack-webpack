# ack-webpack
A code bundler that drastically reduces setup time by offering an init prompt of project setup questions and includes a fantastic browser reloader.

> NOTE: This package does not depend on webpack and is completely useful without ever installing webpack

Typical a 4 Step Process
- install
- init
- install jsDependencies
- build or watch your code

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
  - [Optional Global Install](#optional-global-install)
- [Initialization](#initialization)
- [Commands](#commands)
  - [Command Options](#command-options)
  - [Time Saver Scripts](#time-saver-scripts)
- [jsDependencies](#jsDependencies)

## Overview
This package greatly reduces common project setup times for the task of bundling javascript code.

- Includes ability to code watch without the use of webpack nor webpack-dev-server
  - ack-webpack reloader does not include hot swap reloading, install webpack-dev-server for that boost
- Includes sophisticated CLI init commands to help get a project going
  - Somewhat experimental and needs refinements for more complicated tasks
- Includes sophisticated CLI install commands to help included jsDependencies that are seperate from devDependencies

## Installation
Install ack-webpack into your project

```
npm install ack-webpack --save-dev
```
> postinstall, one entry will be added into your package.json scripts of "ack-webpack":"ack-webpack" to allow short-hand cli commands

## Initialization
ack-webpack does not operate standing alone, it requires your instructions.

```
npm run ack-webpack -- init
```
> The above command works because during postinstall of ack-webpack, a script entry was added to your package.json

#### Optional Global Install
It's possible to make your commands even shorter by installing ack-webpack globally

```
npm install -g ack-webpack
```
> If you did install ack-webpack globally, your init now looks as follows
```
ack-webpack init
```

## Commands

Build Example
```
npm run ack-webpack -- app/index.js www/app.js --production
```

Build Example 2. Same Above Example, using Global Installation
```
ack-webpack app/index.js www/app.js --production
```

Build, Watch Code, and Reload Browser Example
```
ack-webpack app/index.js www/app.js --watch --browser=www/
```

Browser Test Example
```
ack-webpack reload www
```

Build. After Build, Show in Browser Example
```
ack-webpack app/index.js www/app.js --production --browser
```



#### Command Options

- **skip-source-maps** Boolean - javascript minify pointers in .map file (adds compile time)
- **production** Boolean = false - output files will be minified with NO source-maps
- **minify** Boolean = false - output files will be compressed
- **watch** Boolean = false - files are built and kept in memory and recompiled on any change
- **browser** String - opens browser on computer. Add = sign and path to server if not same path as build file
- **port** Number = 3000 - What port to run reload browser

#### Time Saver Scripts
Add these recommended entries into your package.json scripts to save yourself sometime

package.json convenience scripts
```
{
  "scripts":{
    "start": "ack-webpack reload src-path",
    "build": "ack-webpack src-path/index.js www/index.js --production",
    "watch": "ack-webpack src-path/index.js www/index.js --watch --browser=www/"
  }
}
```

Now you can simply just run the following commands
```
npm run build
```
```
npm run watch
```

## jsDependencies
To make life easier, ack-webpack params and utilizes a "jsDependencies" key of package.json files

### Install your own jsDependencies
This will add an entry to your package.json jsDependencies

```
npm run ack-webpack -- install ack-angular-fx
```

> Currenty, you cannot specify a version in the install command. Coming soon. Maybe you can make the pull request for this?

### Install All jsDependencies
Almost like `npm install` but for jsDependencies

```
npm run ack-webpack -- install ack-angular-fx
```
