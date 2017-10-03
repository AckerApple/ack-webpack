const path = require('path')
const fs = require('fs')
const promisePrompt = require('../promisePrompt.function')
const JsonHelp = require('./json.help')

module.exports = class PackHelp extends JsonHelp{
  constructor(packPath){
    super(packPath)
    this.packPath = path.join(process.cwd(),'package.json')
  }

  scriptDefined(name){
    const packJson = this.loadJson()
    return packJson.scripts && packJson.scripts[name]
  }

  setScript(name, script, details){
    this.loadJson()
    this.packJson.scripts = this.packJson.scripts || {}
    this.packJson.scripts[ name ] = script

    if(details){
      this.packJson.scriptsInfo = this.packJson.scriptsInfo || {}
      this.packJson.scriptsInfo[ name ] = details
    }
  }

  getScript(name){
    this.loadJson()
    
    if( this.packJson.scripts && this.packJson.scripts[name] ){
      return this.packJson.scripts[name]
    }
  }
}