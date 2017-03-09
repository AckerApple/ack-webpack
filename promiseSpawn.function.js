const childProcess = require('child_process')
const spawn = childProcess.spawn;
const windows = process.platform === 'win32'

const spawnOptions = {
  cwd: process.cwd(),
  env: process.env,
  shell:windows
}

function filterArgs(args){
  return args.map(value=>escape(value))
}

/**
  @options - {
    log:optional, typically console.log.bind(console)
  }
*/
module.exports = function promiseJavaSpawn(sArgs, options){
  return new Promise((res,rej)=>{
    const dataArray = []

    if(windows){
      sArgs = filterArgs(sArgs)
    }

    const command = sArgs.shift()
    const ls = spawn(command, sArgs, spawnOptions);
    var spawnError = null

    const upgradeError = err=>{
      if(!err)return err

      if(err.message){
        let msg = err.msg
        msg += '\ncommand-args:'+ JSON.stringify(sArgs)
        err = new Error(msg)
      }else if(err.split){
        let msg = err
        msg += '\ncommand-args:'+ JSON.stringify(sArgs)
        err = new Error(msg)
      }

      return err
    }

    ls.stdout.on('data', data=>dataArray.push(data));
    ls.stderr.on('data', data=>dataArray.push(data));
    ls.stdout.on('error', err=>spawnError=err)
    ls.stderr.on('error', err=>spawnError=err)

    if(options && options.log){
      ls.stdout.on('data', data=>options.log(data.toString()));
      ls.stderr.on('data', data=>options.log(data.toString()));
      ls.stdout.on('error', err=>options.log(err))
      ls.stderr.on('error', err=>options.log(err))
    }


    ls.on('close', code=>{
      if(spawnError){
        return rej( upgradeError(spawnError) )
      }

      const output = dataArray.join('')//bring all cli data together
      res( output )
      //res()
    })
  })
}