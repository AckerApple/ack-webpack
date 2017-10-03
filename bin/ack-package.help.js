const path = require('path')
const fs = require('fs')
const promisePrompt = require('../promisePrompt.function')
const JsonHelp = require('./json.help')

module.exports = class AckPackHelp extends JsonHelp{
  constructor(packPath){
    super(packPath)
    this.packPath = packPath || path.join(process.cwd(),'.ack-webpack.json')
  }

  updatePrompt(name, results){
    const json = this.loadJson()
    json[name] = json[name] || {}
    Object.assign(json[name], results)
    return this
  }
}