const path = require('path')
const webpack = require("webpack");
const log = require("./log.function");
const staticConfig = require('./webpack.config')

const reload = require('reload')

/** uses process args to determin port and if to watch */
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

  var browser = null
  process.argv.forEach((a,i)=>{
    if(a.search(/^--browser/)>=0){
      browser = a
    }
  })
  
  const portArgIndex = process.argv.indexOf('--port')>0
  let port = 3000
  if(portArgIndex>0){
    port = Number( process.argv[portArgIndex+1] )
  }

  let onRebuild = function(){}//foo onRebuild function that will be replaced
  const compileOps = {
    onRebuild:function(stat){//memory container link to true onRebuild function
      onRebuild(stat)
    }
  }
  
  let promise = watchMode ? watchCompiler(compiler,compileOps) : buildCompiler(compiler,compileOps)

  if(browser){
    let browserFolderPath = outputFileFolder
    const browserDef = browser.split('=')

    if(browserDef.length>1){
      browserDef.shift()//remove first part
      browserFolderPath = browserDef.join('=')

      if( !path.isAbsolute(browserFolderPath) ){
        browserFolderPath = path.join(process.cwd(), browserFolderPath)
      }
    }

    const options = {
      open:true,
      watch:false,
      //hostname:'127.0.0.1',
      //startPage:'index.html',
      message:'[ack-webpack]',
      log:log,
      port:port,
      //ignoreDotFiles:true,
      /*
      filter:function(pathTo,stat){
        return stat.isDirectory() || pathTo.search(/\.(js|css|html)$/)>=0
      }*/
    }

    promise = promise
    .then(()=>reload(browserFolderPath, options))
    .then(reloadConfig=>onRebuild = reloadConfig.reload)
  }

  return promise
  .catch(e=>log.error(e))
}

/** use npm watch for file watching
  @options{
    onRebuild
  }
*/
function watchCompiler(compiler, options={}){
  let watching = false
  log('Watch Building')
  const startWatchTime = Date.now()
  const watchConfig = { // watch options:
    //aggregateTimeout: 300, // wait so long for more changes
    //poll: true // use polling instead of native watchers
    // pass a number to set the polling interval
  }

  options.onRebuild = options.onRebuild || function(){}

  return new Promise(function(res,rej){  
    compiler.watch(watchConfig, function(err,stats){
      if(err)return rej(err)

      if(watching){
        log('Rebuilt '+getServerTime())
        options.onRebuild(stats)
      }else{
        watching = true
        log('Watching '+(Date.now()-startWatchTime)/1000+' seconds')
        res( this )
      }
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


function formatTime(d){var h=d.getHours(),t='AM',m=d.getMinutes();m=m<10?'0'+m:m;h=h>=12?(t='PM',h-12||12):h==0?12:h;return ('0'+h).slice(-2)+':'+m+':'+d.getMilliseconds()+' '+t}


