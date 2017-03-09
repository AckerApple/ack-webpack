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
}

new SubInstall( rootPackPath ).performInstalls().catch(e=>console.error(e))