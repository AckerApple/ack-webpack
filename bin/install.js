#!/usr/bin/env node
const ackPath = require('ack-path')
const ackP = require('ack-p')
const fs = require('fs')
const path = require('path')
const log = require('../log.function')
const install = require('../install.function')
const rootPackPath = process.cwd()

class SubInstall{
  constructor(packPath, config={originalPackage:null, lock:false, dev:true}){
    this.packPath = packPath
    this.config = config
  }

  discoverPackPathBy(pathing, original){
    original = original || pathing
    const packPath = path.join(pathing,'package.json')
    const exists = fs.existsSync( packPath )

    if(exists)return packPath

    if(this.packPath.split(path.sep).length==pathing.split(path.sep)){
      throw new Error('Could not find package.json by path: '+original)
    }

    return this.discoverPackPathBy( path.join(pathing,'../'), original )
  }

  isLockMode(){
    return this.config.lock
  }

  getDepKey(){
    return this.config.depKey || 'jsDependencies'
  }

  getPackPath(){
    return this.discoverPackPathBy(this.packPath)
  }

  getPack(){
    if( this.packageJson )return this.packageJson;
    return this.packageJson = this.fetchPack()
  }

  fetchPack(){
    return JSON.parse( fs.readFileSync( this.getPackPath() ).toString() )
  }

  getInstalls(){
    return this.getPack()[ this.getDepKey() ]
  }

  performInstalls(name, version){
    return this.performInstallsBy( this.getInstalls() )
  }
  
  performInstallBy(name, version){
    const ob = {}    
    ob[name] = version
    return this.performInstallsBy(ob)
  }

  performInstallsBy(installs){
    let promise = Promise.resolve()

    if(!installs)return promise

//    const installArray = []
//    const subInstalls = []
    Object.keys(installs).forEach(name=>{
      const versionDef = installs[name] ? '@' + installs[name] : ''
      const installDef = name + versionDef

      let resolvePath = ''

      if(this.config.prefix){
        resolvePath = path.join(process.cwd(), this.config.prefix, 'node_modules', name)
      }else{
        resolvePath = path.join(process.cwd(), 'node_modules', name)
      }

      promise = promise.then( ()=>install(installDef, this.config) )
      .then( config=>this.saveName(name, installs[name]) )
      .then( ()=>new SubInstall( require.resolve(resolvePath), this.config) )
      .then( SubInstall=>SubInstall.performInstalls() )
    })

    return promise
  }

  saveName(name, version){
    if(!this.config.lock){
      return name
    }

    const pack = this.fetchPack()//always a fresh copy incase background changes like npm modified the package.json file
    const key = this.getDepKey()
    pack[ key ] = pack[ key ] || {}
    pack[ key ][ name ] = version
    this.savePack( pack )
  }

  saveInstallByName(name){
    const vSplit = name.split('/').pop().split('@')
    let nameOnly = []
    
    if(vSplit.length>1){
      nameOnly = name.split('@')
      nameOnly.pop()

      let version = vSplit.pop()
      return this.saveInstallBy(nameOnly.join('@'), name, version)
    }

    //non-npm install
    if( name.search(/^[^:]+:/)>=0 ){
      nameOnly = name.split('/')
      return this.saveInstallBy(nameOnly.pop(), name, name)
    }

    return install.promiseVersion(name)
    .then(version=>this.saveInstallBy(name,name,version))
  }

  saveInstallBy(name, install, version){
    const pack = this.getPack()
    pack.jsDependencies = pack.jsDependencies || {}
    pack.jsDependencies[ name ] = (version || name)
  }

  savePack(pack){
    pack = pack || this.getPack()
    const packPath = this.discoverPackPathBy(this.packPath)
    const data = JSON.stringify(pack, null, 2)
    fs.writeFileSync(packPath, data)
  }
}

module.exports.exec = function(args){
  args = args || process.argv

  const subInstall = new SubInstall( rootPackPath )
  let promise = ackP.resolve()
  log('Reading Package', subInstall.getPackPath())

  if(args.indexOf('--lock')>=0){
    subInstall.config.lock = true
  }

  const depKeyArgIndex = args.indexOf('--depkey')
  if(depKeyArgIndex>0){
    subInstall.config.depKey = args[ depKeyArgIndex+1 ]
  }

  let out = ''
  const outArgIndex = args.indexOf('--out')
  if(outArgIndex>=0){
    out = args[ outArgIndex+1 ]
  }
  
  const RootPath = ackPath(rootPackPath).join('.ack-webpack-temp')
  const MoveTo = ackPath(rootPackPath).join(out)
  
  if(out){
    subInstall.config.prefix = './.ack-webpack-temp'
    const fooPack = '{"description":"...", "repository":"...", "license":"UNLICENSED"}'
    const TempNodeModules = RootPath.Join('node_modules')

    promise = promise.then( ()=>RootPath.param() )
    .then( ()=>RootPath.File('package.json').param(fooPack) )
    .then( ()=>MoveTo.moveTo( TempNodeModules ) )//maybe install folder exists?
    .catch('ENOENT', e=>null)
  }

  const requestedInstalls = []

  for(let x=3; x < args.length; ++x){
    if(args[x].substring(0, 2)=='--')break;
    requestedInstalls.push( args[x] )
  }

  if( requestedInstalls.length ){
    requestedInstalls.forEach(name=>{
      subInstall.config.lock = args.indexOf('--lock')>=0
      //subInstall.config.originalPackage = subInstall.getPack()
      promise = promise.then( ()=>install.promiseVersion(name) )
      promise = promise.then( version=>subInstall.performInstallBy(name, version) )
      promise = promise.then( ()=>subInstall.saveInstallByName(name) )
      promise = promise.then( ()=>subInstall.savePack() )
    })

    if( args.indexOf('--no-save')<0 ){
      promise = promise.then( ()=>subInstall.savePack(subInstall.config.originalPackage) )
    }
  }else{  
    promise = promise.then( ()=>subInstall.performInstalls() )
  }

  if(out){
    promise = promise
    .then( ()=>MoveTo.param() )
    .then( ()=>RootPath.Join('node_modules').moveTo(MoveTo.path,true) )
    .then( ()=>RootPath.delete() )
  }

  promise.catch( e=>log.error(e) )
}