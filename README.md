# ack-webpack
A code bundler that drastically reduces setup time by offering an init prompt of project setup questions and includes a fantastic browser reloader.

> NOTE: This package does not depend on webpack and is completely useful without ever installing webpack

A 4 Step Process
- install
- init
- install jsDependencies
- build/watch your code

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
  - [Optional Global Install](#optional-global-install)
- [Initialization](#initialization)
- [Commands](#commands)
  - [Compile Commands](#compile-commands)
    - [Compile Command Options](#compile-command-options)
  - [Install Commands](#install-commands)
    - [Install Command Options](#install-command-options)
  - [Time Saver Scripts](#time-saver-scripts)

## Overview
This package greatly reduces common project setup times for the task of bundling javascript code.

- Includes ability to code watch without the use of webpack nor webpack-dev-server
  - ack-webpack reloader does not include hot swap reloading, install webpack-dev-server for that boost
- Includes sophisticated CLI init commands to help get a project going
  - Somewhat experimental and needs refinements for more complicated tasks
- Includes sophisticated CLI install commands to help included jsDependencies that are seperate from devDependencies

## Installation
Install ack-webpack into your project

```bash
npm install ack-webpack --save-dev
```
> postinstall, one entry will be added into your package.json scripts of "ack-webpack":"ack-webpack" to allow short-hand cli commands

## Initialization
ack-webpack does not operate standing alone, it requires your instructions.

```bash
npm run ack-webpack -- init
```
> The above command works because during postinstall of ack-webpack, a script entry was added to your package.json

#### Optional Global Install
It's possible to make your commands even shorter by installing ack-webpack globally

```bash
npm install -g ack-webpack
```
> If you did install ack-webpack globally, your init now looks as follows
```bash
ack-webpack init
```

## Commands
- [Compile Commands](#compile-commands)
- [Install Commands](#install-commands)


### Compile Commands
Get your code where and how you want it with ack-webpack compiling commands

#### Compile Command Options

- **skip-source-maps** Boolean
  - javascript minify pointers in .map file (adds compile time)
- **production** Boolean = false
  - output files will be minified with NO source-maps
- **minify** Boolean = false
  - output files will be compressed
- **watch** Boolean = false
  - files are built and kept in memory and recompiled on any change
- **browser** String
  - opens browser on computer. Add = sign and path to server if not same path as build file
- **port** Number = 3000
  - What port to run reload browser
- **modules**
  - comma delimited list of node_modules like folders
  - commonly used as `--modules js_modules`
  - equivalent to `webpack.config.js.resolve.modules = ["node_modules"]`
  - Using js_modules to satisfy typescript troubles?
    - Add the following to your tsconfig.json file "compilerOptions"
      - `"compilerOptions":{"paths":{"*":["node_modules/*","js_modules/*"]}}`

#### Compile Command Examples

Build Example
```bash
npm run ack-webpack -- app/index.js www/app.js --production
```

Build Example 2. Same Above Example, using Global Installation
```bash
ack-webpack app/index.js www/app.js --production
```

Build, Watch Code, and Reload Browser Example
```bash
ack-webpack app/index.js www/app.js --watch --browser=www/
```

Browser Test Example
```bash
ack-webpack reload www
```

Build. After Build, Show in Browser Example
```bash
ack-webpack app/index.js www/app.js --production --browser
```

### Install Commands
To make life easier, ack-webpack params and utilizes a "jsDependencies" key of package.json files

### Install Command Options

- **out**
  - default is npm **node_modules** folder
  - Commonly set to **js_modules** when overcoming restrictions/limitations or other like issues with targeting node_modules folder
- **lock**
  - writes all sub-package jsDependencies into your package.json file jsDependencies as if they were direct dependencies of current project
- **depkey** = jsDependencies

#### Install your own jsDependencies
Similar to `npm install` but reads/writes **jsDependencies** instead of devDependencies or dependencies.

Example: Install ack-angular-fx
```bash
npm run ack-webpack -- install ack-angular-fx
```
> The above, will auto param **jsDependencies** in your package.json file and add ack-angular-fx to it

Compound Installs
```bash
npm run ack-webpack -- install ack-x ack-angular-fx@^1.03 ack-p
```

Lock subsequent jsDependencies by having them written into your main package.json.jsDependencies
```bash
npm run ack-webpack -- install ack-angular-fx --lock
```

#### Change Install Path
There are times the node_modules folder is not enough. And when using Angular2 compiler-cli with AoT, the node_modules folder must not be used.

```bash
npm run ack-webpack -- install --out js_modules
```

### Install All jsDependencies
Almost like `npm install` but for jsDependencies

```bash
npm run ack-webpack -- install ack-angular-fx
```

### Time Saver Scripts
Add these recommended entries into your package.json scripts to save yourself sometime

package.json convenience scripts
```javascript
{
  "scripts":{
    "start": "ack-webpack reload src-path",
    "build": "ack-webpack src-path/index.js www/index.js --production",
    "watch": "ack-webpack src-path/index.js www/index.js --watch --browser=www/",
    "install:js": "ack-webpack install",
    "install:ts": "ack-webpack install --out js_modules"
  }
}
```

Now you can run any of the following in a command prompt terminal
```bash
npm run build
```
```bash
npm run watch
```

[table of contents](#table-of-contents)