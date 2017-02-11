const fs = require('fs')
const log = require("./log.function");
const packPath = require('path').join(process.cwd(),'../','../','package.json')

try{
  const pack = require(packPath)
  upgradePack(pack)
}catch(e){
  log('Could not upgrade '+packPath)
}

function upgradePack(pack,packPath){
  pack.scripts = pack.scripts || {}
  pack.scripts['ack-webpack'] = pack.scripts['ack-webpack'] || 'ack-webpack'
  fs.writeFileSync(packPath, pack)
}