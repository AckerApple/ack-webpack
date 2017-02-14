const path = require('path')
const webpack = require("webpack");
const log = require("./log.function");
const staticConfig = require('./webpack.config')

/* todo: create ack-reload */
const fs = require('fs')
const http = require('http')
const watch = require('watch')
const open = require('open')

module.exports = function(fromPath, outPath){
  const config = Object.assign({}, staticConfig)

  const outputFileFolder = path.join(outPath,'../')
  const outputFileName = outPath.split(path.sep).pop()

  config.entry = fromPath
  config.output = {
    path:outputFileFolder,
    filename:outputFileName
  }
  
  const compiler = webpack(config);
  const watchMode = process.argv.indexOf('--watch')>0
  const browser = process.argv.indexOf('--browser')>0
  
  const portArgIndex = process.argv.indexOf('--port')>0
  let port = 3000
  if(portArgIndex>0){
    port = Number( process.argv[portArgIndex+1] )
  }

  let promise = watchMode ? watchCompiler(compiler) : buildCompiler(compiler)

  if(browser){
    promise = promise
    .then(()=>createFolderWatchServer(outputFileFolder, port))
    .then(()=>open('http://localhost:' + port))
  }

  return promise
  .catch(e=>console.error(e))
}

function watchCompiler(compiler){
  let watching = false
  log('Watch Building')
  const startWatchTime = Date.now()
  const watchConfig = { // watch options:
    aggregateTimeout: 300, // wait so long for more changes
    poll: true // use polling instead of native watchers
    // pass a number to set the polling interval
  }

  const callback = function(stats) {
    if(watching){
      log('Rebuilt '+getServerTime())
    }else{
      log('Watching '+(Date.now()-startWatchTime)/1000+' seconds')
      watching = true
    }
    return stats
  }

  return new Promise((res,rej)=>{
    compiler.watch(watchConfig, (err,stats)=>{
      if(err)return rej(err)
      res( callback(stats) )
    });
  })
}

function buildCompiler(compiler){
  log('Building')
  const startBuildTime = Date.now()
  return new Promise((res,rej)=>{  
    compiler.run(function(err, stats) {
      if(err){
        return rej(err)
      }
      log('Building Completed in '+(Date.now()-startBuildTime)/1000+' seconds')
      res(stats)
    });
  })
}

function getServerTime(){
  return formatTime(new Date())
}

function startWatchingFolder(pathTo,reloader){    
  const watchOptions = {
    ignoreDotFiles:true,
    filter:function(pathTo){
      return pathTo.search(/\.(js|css|html)$/)>=0
    }
  }
  watch.createMonitor(pathTo, watchOptions, function (monitor) {
    //monitor.files['/home/mikeal/.zshrc'] // Stat object for my zshrc.
    monitor.on("created", function (f, stat) {
      reloader.reload()// Handle new files
    })
    monitor.on("changed", function (f, curr, prev) {
      reloader.reload()// Handle file changes
    })
    monitor.on("removed", function (f, stat) {
      reloader.reload()// Handle removed files
    })
    //monitor.stop(); // Stop watching
  })
}

function createFolderWatchServer(outputFileFolder, port){
  var reloadCallback = null
  const reload = require('reload')
  const reloadServer = require('reload')
  const static = require('node-static')
  const fileRouter = new static.Server(outputFileFolder);
  //const WebSocketServer = require('ws').Server

  //fake express app for reload
  const app = function(req,res){
    if(req.url=='/reload/reload.js'){      
      res.type = function(value){res.setHeader('Content-Type',value)}
      res.send = function(content){
        if(content.constructor!=String){
          content = JSON.stringify(content)
        }
        res.end(content)
      }
      return reloadCallback ? reloadCallback(req,res) : res.end('404 missing reload callback')
    }

    if(req.url=='/'){
      let reqFile = req.url.replace(/(.*\/)([^?]*)(\?.*)*/g,'$2')
      console.log('reqFile',reqFile)
      reqFile = reqFile || 'index.html'
      reqFile = reqFile.replace('/',path.sep)
      let fileContents = fs.readFileSync(path.join(outputFileFolder,reqFile)).toString()
      fileContents += '<script src="/reload/reload.js"></script>'
      res.setHeader('Content-Type','text/html')
      res.end(fileContents)        
    }else{
      fileRouter.serve(req,res)
    }
  }

  const httpServer = http.createServer(app)
  app.get = function(route,callback){
    reloadCallback = callback
  }
  
  const reloader = reload(httpServer, app)
  return new Promise(function(res,rej){
    httpServer.listen(port, function(err){
      if(err)return rej(err)
      log("Web server listening on port " + port);
      res()
    })
  })
  .then(()=>startWatchingFolder(outputFileFolder, reloader))
}


function formatTime(d){var h=d.getHours(),t='AM',m=d.getMinutes();m=m<10?'0'+m:m;h=h>=12?(t='PM',h-12||12):h==0?12:h;return ('0'+h).slice(-2)+':'+m+':'+d.getMilliseconds()+' '+t}