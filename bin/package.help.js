const path = require('path')
const fs = require('fs')
const promisePrompt = require('../promisePrompt.function')

module.exports = class PackHelp{
  constructor(packPath){
    this.packPath = packPath || path.join(process.cwd(),'package.json')
  }

  getPackJson(){
    const file = fs.readFileSync( this.packPath )
    const contents = file.toString()
    return JSON.parse( contents )
  }

  loadPackJson(filePath){
    if(this.packJson)return this.packJson
    const file = fs.readFileSync( this.packPath )
    const contents = file.toString()
    return this.packJson = JSON.parse( contents )
  }

  scriptDefined(name){
    const packJson = this.loadPackJson()
    return packJson.scripts && packJson.scripts[name]
  }

  save(){
    this.loadPackJson()
    const write = JSON.stringify(this.packJson, null, 2)
    fs.writeFileSync(this.packPath, write)
  }
}