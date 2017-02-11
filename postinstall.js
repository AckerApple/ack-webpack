const fs = require('fs')
const log = require("./log.function");
const packPath = require('path').join(process.cwd(),'../','../','package.json')

try{
  const pack = require(packPath)
  upgradePack(pack,packPath)
}catch(e){
  log('Could not upgrade '+packPath)
  log(e)
}

function upgradePack(pack,packPath){
  pack.scripts = pack.scripts || {}
  if(!pack.scripts['ack-webpack']){
    pack.scripts['ack-webpack'] = 'ack-webpack'
    log('added package.scripts.ack-webpack to:',packPath)
  }
  fs.writeFileSync(packPath, pack)
}