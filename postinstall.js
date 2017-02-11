const fs = require('fs')
const log = require("./log.function");
const packPath = require('path').join(process.cwd(),'../','../','package.json')

try{
  const pack = require(packPath)
  upgradePack(pack,packPath)
}catch(e){
  log.warn('Could not upgrade '+packPath)
  log.warn(e)
}

function upgradePack(pack,packPath){
  pack.scripts = pack.scripts || {}
  if(!pack.scripts['ack-webpack']){
    pack.scripts['ack-webpack'] = 'ack-webpack'
    log('added npm run ack-webpack script to:',packPath)
  }
  fs.writeFileSync(packPath, JSON.stringify(pack, null, 2))
}