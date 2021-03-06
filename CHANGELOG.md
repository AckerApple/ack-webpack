# ack-webpack - Change Log
All notable changes to this project will be documented here.

## [1.3.0] - 2018-(UNRELEASED)
- Tailored for Angular 6 and ack-apps

## [1.2.2] - 2018-01-05
- Added additional extension to webpack config

## [1.2.0] - 2017-12-14
- Angular 4 commands geared more towards Angular 5 now

## [1.1.52] - 2017-11-22
### Fixed
- had needed folder named "test" but .gitignore'd it so renamed to "test-tools"
- add noscript to ack-angular/index.pug

## [1.1.51] - 2017-09-20
### Added
- init:angular:test

## [1.1.50] - 2017-09-20
### Fixed
- pug-cli was not apart of the pug installs

## [1.1.42] - 2017-07-17
### Added
- init:ts-dist
### Fix
- promiseSpawn

## [1.1.38] - 2017-07-14
### Added
- init:ack-angular
- init:ack-app

## [1.1.37] - 2017-07-12
### Added
- init:font-awesome prompt of queries

## [1.1.35] - 2017-04-17
### Added
- npm run -- ack-webpack init:angular
- tsconfig file is no longer auto created
- reload support for --html5Mode

## [1.1.31] - 2017-04-17
### Fixed port cli argument

## [1.1.27] - 2017-03-28
### Fixed
- modules relative path pointing

## [1.1.26] - 2017-03-22
### Added
- modules argument for compiling
- install:js
- more logically sound install --out folder processing
- install --no-save argument

## [1.1.21] - 2017-03-21
### Added
- Ability to specify install output location via --out cli option

## [1.1.18] - 2017-03-20
### Added
- lock option for cli install
- docs

## [1.1.7] - 2017-03-15
### Enhanced
- screw IE8 for better compression
### Fixed
- modified webpack.config.js as production mode was failing

## [1.1.16] - 2017-03-09
### Added
- new install process that targets installing jsDependency definitions of package.json file

## [1.1.11] - 2017-03-02
### Change
- tsconfig output handling. Now es5 is default transpile, left tsconfig.es6.json for future as default es6
### Enhanced
- Time output console string includes seconds now

## [1.1.9] - 2017-02-23
### Enhanced
- Watching files for browser reload is now lighting fast

## [1.1.8] - 2017-02-22
### Changed
- default port is 8080 instead of 3000
### Fixed
- webpack.config.js for typescript
- bad if condition for minify

## [1.1.5] - 2017-02-20
### Added
- completed integration of updated-reload code
- now able to open browser and auto refresh on code changes
- reload cli command

## [1.1.2] - 2017-02-14
### Fixed
- Made Windows friendly
- Pug loader syntax issues

## [1.1.1] - 2017-02-13
### Added
- Almost everything needed to watch, serve, and reload browser files

## [1.1.0] - 2017-02-12
### Breaking Changes
- Packages are no longer auto installed and an init process must be used in-place
- New approach of using command prompt queries to decide installation dependencies

## [1.0.8] - 2017-02-10
### Enhanced
- more messaging during watching

## [1.0.6] - 2016-12-19
### Defaulted
- webpack config option bail=true
