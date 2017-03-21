const log = require("./log.function")
const promiseSpawn = require('./promiseSpawn.function')

module.exports = function install(name, options={}){
  const args = ['npm','install',name]
  log('$',args.join(' '))
  if(options.prefix){
    args.push('--prefix')
    args.push(options.prefix)
  }
  return promiseSpawn(args, {log:log})
}

module.exports.promiseVersion = function(name){
  const args = ['npm', 'view', name, 'version']
  log('$',args.join(' '))
  return promiseSpawn(args).then(version=>version.trim())
}