const log = require("./log.function")
const promiseSpawn = require('./promiseSpawn.function')

module.exports = function install(name){
  const args = ['npm','install',name]
  log('$',args.join(' '))
  return promiseSpawn(args)
}