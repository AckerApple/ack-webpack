#!/usr/bin/env node
const ackPath = require('ack-path')
const fs = require('fs')
const path = require('path')
const log = require('../log.function')
const install = require('../install.function')
const rootPackPath = process.cwd()

let out = ''
const outArgIndex = process.argv.indexOf('--out')
if(outArgIndex>=0){
  out = process.argv[ outArgIndex+1 ]
}

class SubInstall{
  constructor(packPath, config={originalPackage:null, lock:false}){
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
    return process.argv.indexOf('--lock')>=0
  }

  getDepKey(){
    const depKeyArgIndex = process.argv.indexOf('--depkey')
    
    if(depKeyArgIndex>0){
      return process.argv[depKeyArgIndex+1]
    }

    return 'jsDependencies'
  }

  getPackPath(){
    return this.discoverPackPathBy(this.packPath)
  }

  getPack(){
    if( this.packageJson )return this.packageJson;
    return this.packageJson = JSON.parse( fs.readFileSync( this.getPackPath() ).toString() )
  }

  getInstalls(){
    return this.getPack()[ this.getDepKey() ]
  }

  performInstalls(){
    return this.performInstallsBy( this.getInstalls() )
  }

  performInstallsBy(installs){
    let promise = Promise.resolve()

    if(!installs)return promise

//    const installArray = []
//    const subInstalls = []
    Object.keys(installs).forEach(name=>{
      let installDef = name+'@'+installs[name]
      const resolvePath = path.join(process.cwd(), this.config.prefix, 'node_modules',name)

      promise = promise.then( ()=>install(installDef, this.config) )
      .then( config=>this.saveName(name, installs[name]) )
      .then( ()=>new SubInstall( require.resolve(resolvePath), this.config) )
      .then( SubInstall=>SubInstall.performInstalls() )
/*
      installArray.push( installDef )
      this.saveName(name, installs[name])
      promise = promise.then( ()=>install(name,this.config) )
      promise.then( ()=>subInstalls.push(new SubInstall( require.resolve(name), this.config)) )
*/
    })
/*
    return install(installArray.join(' '),this.config)
    .then( ()=>subInstalls.map(SubInstall=>SubInstall.performInstalls()) )
    .then( promises=>Promise.all(promises) )
*/
    return promise
  }

  saveName(name, version){
    if(!this.config.lock || !this.config.originalPackage){
      return name
    }
    this.config.originalPackage[ this.getDepKey() ][ name ] = version
    return name
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
    
    const installDef = {}
    installDef[name] = version
    return this.performInstallsBy( installDef )
  }

  savePack(pack){
    pack = pack || this.getPack()
    const packPath = this.discoverPackPathBy(this.packPath)
    const data = JSON.stringify(pack, null, 2)
    fs.writeFileSync(packPath, data)
  }
}

const subInstall = new SubInstall( rootPackPath )
let promise = Promise.resolve()
log('Reading Package', subInstall.getPackPath())

const RootPath = ackPath(rootPackPath).join('.ack-webpack-temp')
if(out){
  subInstall.config.prefix = './.ack-webpack-temp'
  promise = promise.then( ()=>RootPath.param() )
  promise = promise.then( ()=>RootPath.File('package.json').param('{"description":"...", "repository":"...", "license":"UNLICENSED"}') )
}

const requestedInstalls = []

for(let x=3; x < process.argv.length; ++x){
  if(process.argv[x].substring(0, 2)=='--')break;
  requestedInstalls.push( process.argv[x] )
}

if( requestedInstalls.length ){
  subInstall.config.lock = process.argv.indexOf('--lock')>=0
  subInstall.config.originalPackage = subInstall.getPack()
  for(let x=0; x < requestedInstalls.length; ++x){
    promise = promise.then( ()=>subInstall.saveInstallByName(requestedInstalls[x]) )
  }

  promise = promise.then( ()=>subInstall.savePack(subInstall.config.originalPackage) )
}else{  
  promise = promise.then( ()=>subInstall.performInstalls() )
}

if(out){
  const MoveTo = ackPath(rootPackPath).join(out)
  promise = promise
  .then( ()=>MoveTo.param() )
  .then( ()=>RootPath.Join('node_modules').moveTo(MoveTo.path,true) )
  .then( ()=>RootPath.delete() )
}

promise.catch( e=>log.error(e) )