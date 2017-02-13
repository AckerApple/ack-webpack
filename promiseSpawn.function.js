const childProcess = require('child_process')
const spawn = childProcess.spawn;

module.exports = function promiseJavaSpawn(sArgs){
  return new Promise((res,rej)=>{
    const dataArray = []
    const command = sArgs.shift()
    const ls = spawn(command, sArgs);
    let spawnError = null

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

    ls.on('close', code=>{
      if(spawnError){
        return rej( upgradeError(spawnError) )
      }

      const output = dataArray.join('')//bring all cli data together
      res( output )
    })
  })
}