#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const install = require('../install.function')
const rootPackPath = process.cwd()

class SubInstall{
  constructor(packPath){
    this.packPath = packPath
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

  getDepKey(){
    const depKeyArgIndex = process.argv.indexOf('--depkey')
    
    if(depKeyArgIndex>0){
      return process.argv[depKeyArgIndex+1]
    }

    return 'jsDependencies'
  }

  getPack(){
    const packPath = this.discoverPackPathBy(this.packPath)
    return JSON.parse( fs.readFileSync( packPath ).toString() )
  }

  getInstalls(){
    return this.getPack()[ this.getDepKey() ]
  }

  performInstalls(){
    const installs = this.getInstalls()
    return this.performInstallsBy(installs)
  }

  performInstallsBy(installs){
    let promise = Promise.resolve()
    
    for(let x in installs){
      let installDef = x+'@'+installs[x]
      promise = promise.then(()=>install(installDef))
      .then(()=>{
        const subPackPath = require.resolve(x)
        return new SubInstall(subPackPath).performInstalls()
      })
    }

    return promise
  }

  saveInstallByName(name){
    const vSplit = name.split('/').pop().split('@')
    
    if(vSplit.length>1){
      const nameOnly = name.split('@')
      nameOnly.pop()

      let version = vSplit.pop()
      return this.saveInstallBy(nameOnly.join('@'), version)
    }

    return install.promiseVersion(name)
    .then(version=>this.saveInstallBy(name,version))
  }

  saveInstallBy(name, version){
    const pack = this.getPack()
    pack.jsDependencies = pack.jsDependencies || {}
    pack.jsDependencies[name] = version
    this.savePack(pack)
    
    const installDef = {}
    installDef[name] = version
    return this.performInstallsBy(installDef)
  }

  savePack(pack){
    const packPath = this.discoverPackPathBy(this.packPath)
    const data = JSON.stringify(pack, null, 2)
    fs.writeFileSync(packPath, data)
  }
}

const subInstall = new SubInstall( rootPackPath )
let promise = Promise.resolve()

if(process.argv.length > 3){
  for(let x=3; x < process.argv.length; ++x){
    if(process.argv[x].substring(0, 2)=='--')break;
    promise = promise.then(()=>subInstall.saveInstallByName( process.argv[x] ))
  }
}else{
  promise = promise.then(()=>subInstall.performInstalls())
}

promise.catch(e=>console.error(e))