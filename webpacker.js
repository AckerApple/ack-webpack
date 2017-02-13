const path = require('path')
const webpack = require("webpack");
const log = require("./log.function");
const staticConfig = require('./webpack.config')

module.exports = function(fromPath, outPath){
  const config = Object.assign({}, staticConfig)
  config.entry = fromPath
  config.output = {
    path:path.join(outPath,'../'),
    filename:outPath.split(path.sep).pop()
  }
  
  const compiler = webpack(config);
  const watch = process.argv.indexOf('--watch')>0
  const browser = process.argv.indexOf('--browser')>0
  
  const portArgIndex = process.argv.indexOf('--port')>0
  let port = 3000
  if(portArgIndex>0){
    port = Number( process.argv[portArgIndex+1] )
  }

  if(watch){
    let watching = false
    log('Watch Building')
    const startWatchTime = Date.now()
    compiler.watch({ // watch options:
      aggregateTimeout: 300, // wait so long for more changes
      poll: true // use polling instead of native watchers
      // pass a number to set the polling interval
    }, function(err, stats) {
      if(err)return console.error(err)
      if(watching){
        log('Rebuilt '+getServerTime())
      }else{
        log('Watching '+(Date.now()-startWatchTime)/1000+' seconds')
        watching = true
      }
    });
  }else{
    log('Building')
    const startBuildTime = Date.now()
    compiler.run(function(err, stats) {
      if(err){
        log('Failed-to-Build')
        return console.error(err)
      }
      log('Building Completed in '+(Date.now()-startBuildTime)/1000+' seconds')
    });
  }

  if(browser){
    var reloadCallback = null
    const reload = require('reload')

    //fake express app for reload
    const app = function(req,res){
      res.type = function(value){res.setHeader('Content-Type',value)}
      res.send = function(content){res.end(JSON.stringify(content))}
      reloadCallback ? reloadCallback(req,res) : res.end('404 missing reload callback')
    }

    const server = http.createServer(app)
    app.get = function(route,callback){
      reloadCallback = callback
    }

    reload(server, app)

    server.listen(port, function(err){
      log("Web server listening on port " + port);
    });
  }
/*
  function relatize(p){
    if(p.substring(0, path.sep.length)!=path.sep){
      p = path.join(process.cwd(), p)
    }
    return p
  }
*/
}

function getServerTime(){
  return formatTime(new Date())
}

function formatTime(d){var h=d.getHours(),t='AM',m=d.getMinutes();m=m<10?'0'+m:m;h=h>=12?(t='PM',h-12||12):h==0?12:h;return ('0'+h).slice(-2)+':'+m+':'+d.getMilliseconds()+' '+t}