# ack-webpack
A code bundler that drastically reduces setup time by offering an init prompt of project setup questions

> 3 Step Process
- install
- init
- build or watch your code

## Table of Contents

- [Overview](#overview)
- [Step One Installation](#step-one-installation)
  - [Optional Global Install](#optional-global-install)
- [Step Two Initialization](#step-two-initialization)
- [Step Three Commands](#step-three-commands)
  - [Command Options](#command-options)
  - [Time Saver Scripts](#time-saver-scripts)

## Overview
This package intends to greatly reduce common project setup times when using webpack to bundle javascript code.

## Step One Installation
Install ack-webpack into your project

```
npm install ack-webpack --save-dev
```
> postinstall, one entry will be added into your package.json scripts of "ack-webpack":"ack-webpack" to allow short-hand cli commands

## Step Two Initialization
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

## Step Three Commands

Build Example
```
npm run ack-webpack -- app/index.js www/app.js --production
```

Same Above Build Example, with Global Installation
```
ack-webpack app/index.js www/app.js --production
```

Watch Example
```
ack-webpack app/index.js www/app.js --watch
```

#### Command Options

- **skip-source-maps** - javascript minify pointers in .map file (adds compile time)
- **production** - output files will be minified with NO source-maps
- **minify** - output files will be compressed
- **watch** - files are built and kept in memory and recompiled on any change


#### Time Saver Scripts
Add these recommended entries into your package.json scripts to save yourself sometime

package.json convenience scripts
```
{
  "scripts":{
    "build": "ack-webpack src-path/index.js www/index.js --production",
    "watch": "ack-webpack src-path/index.js www/index.js --watch"
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
