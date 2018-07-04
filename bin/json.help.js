const path = require('path')
const fs = require('fs')
const promisePrompt = require('../promisePrompt.function')
const PackHelp = require('./json.help')

module.exports = class JsonHelp{
  getJson(){
    try{
      const file = fs.readFileSync( this.packPath )
      const contents = file.toString()
      return JSON.parse( contents )
    }catch(e){
      if(e && e.code=='ENOENT'){
        return {}
      }
    }
  }

  loadJson(filePath){
    if(this.packJson)return this.packJson
    return this.packJson = this.getJson()
  }

  getFolderPath(){
    return path.join(this.packJson,"../")
  }

  save(){
    this.loadJson()
    const write = JSON.stringify(this.packJson, null, 2)
    fs.writeFileSync(this.packPath, write)
  }
}