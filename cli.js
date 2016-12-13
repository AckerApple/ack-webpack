var path = require('path')
var webpack = require("webpack");
var staticConfig = require('./webpack.config')
var config = Object.assign({}, staticConfig)
const watch = process.argv.indexOf('--watch')>0
config.entry = relatize(process.argv[2])
const outPath = relatize(process.argv[3])
config.output = {path:path.join(outPath,'../'), filename:outPath.split(path.sep).pop()}
console.log('config',config)
var compiler = webpack(config);

if(watch){
  console.log('\x1b[36m[ack-webpack]\x1b[0m Watching')
  compiler.watch({ // watch options:
    aggregateTimeout: 300, // wait so long for more changes
    poll: true // use polling instead of native watchers
    // pass a number to set the polling interval
  }, function(err, stats) {
    if(err)return console.error(err)
  });
}else{
  console.log('\x1b[36m[ack-webpack]\x1b[0m Building')
  compiler.run(function(err, stats) {
    if(err){
      console.log('\x1b[31m[ack-webpack]\x1b[0m Failed-to-Build')
      return console.error(err)
    }
    console.log('\x1b[36m[ack-webpack]\x1b[0m Building Completed')
  });
}

function relatize(p){
  if(p.substring(0, path.sep.length)!=path.sep){
    p = path.join(process.cwd(), p)
  }
  return p
}