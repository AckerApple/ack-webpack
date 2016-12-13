# ack-webpack
Includes webpack, babel-loader, json-loader, pug-loader and more

## Table of Contents

- [Overview](#overview)
- [Package Installation](#package-installation)
- [CLI Commands](#cli-commands)

## Overview
This package intends to greatly reduce common project setup times when using webpack to bundle javascript code.

## Package Installation
Install ack-webpack into your project

```
npm install ack-webpack --save-dev
```

### Install Package Scripts
Add script to package.json

package.json
```
{
  "scripts":{
    "build": "ack-webpack src-path/index.js www/index.js --production",
    "build:watch": "ack-webpack src-path/index.js www/index.js --watch"
  }
}
```

## CLI Commands

Example
```
ack-webpack source destination --skip-source-maps --production --minify --watch
```

Options

- **skip-source-maps** - javascript minify pointers
- **production** - output files will be compressed with NO source-maps
- **minify** - output files will be compressed
- **watch** - browser is opened and files are watched to cause refresh
