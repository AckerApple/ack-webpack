const ackPath = require('ack-path')
const promiseSpawn = require('../promiseSpawn.function')
const install = require('../install.function')
const path = require('path')
const fs = require('fs')
const log = require("../log.function")
const promisePrompt = require('../promisePrompt.function')
const PackHelp = require('./package.help.js')
const packHelp = new PackHelp()
const packJson = packHelp.loadPackJson()
const assetDefaultPath = path.join('app','www','assets','fonts','font-awesome')

function runPrompts(){
  const schema = [{
    description:'npm install font-awesome',
    name:'install',
    default:'yes'
  }]

  const scriptDefined = packHelp.scriptDefined("copy:fonts")
  if( !scriptDefined ){
    schema.push({
      description:'Add convenient scripts to npm package',
      name:'addScripts',
      default:'yes'
    })

    schema.push({
      description:'Enter project assets path',
      name:'assetPath',
      default:assetDefaultPath,
      ask: function() {
        const copy = promisePrompt.prompt.history('copyFontAwesome')
        return copy==null ? false : promisePrompt.isLikeTrue( copy.value )
      }
    })
  }

  schema.push({
    description:'Run script to clone font-awesome to assets folder',
    name:'copyFontAwesome',
    default:'yes',
    ask: function() {
      return scriptDefined || promisePrompt.isLikeTrue( promisePrompt.prompt.history('addScripts').value );
    }
  })

  return promisePrompt(schema)
}

function processPrompts(results){
  let promise = Promise.resolve()
  
  if(!results)return promise;

  if(!results.install.length || promisePrompt.isLikeTrue(results.install)){
    promise = promise.then( ()=>promiseSpawn.installPacks(['font-awesome']) )
  }

  const addScripts = results.addScripts!=null && (!results.addScripts.length || promisePrompt.isLikeTrue(results.addScripts))
  if(addScripts){
    const assetPath = results.assetPath.length ? results.assetPath : assetDefaultPath
    const cssFileRef = path.join(assetPath, "css", "font-awesome.min.css")
    const fontFolderRef = path.join(assetPath, "fonts")
    
    packJson.scripts = packJson.scripts || {}
    packJson.scripts["copy:fonts"] = "npm-run-all -s copy:font-awesome:fonts copy:font-awesome:css",
    packJson.scripts["copy:font-awesome:css"] = "ack-path copy node_modules/font-awesome/css/font-awesome.min.css "+cssFileRef,
    packJson.scripts["copy:font-awesome:fonts"] = "ack-path copy node_modules/font-awesome/fonts "+fontFolderRef,

    log('To handle copy/paste of font-awesome files, ack-path will be installed')
    log('To handle running multiple scripts across any device, npm-run-all will be installed')
    log('Installing ack-path and npm-run-all...')
    promise = promise.then( ()=>promiseSpawn.installPacks(['ack-path','npm-run-all']) )
    .then(()=>log('Saving package.json...'))
    .then(()=>packHelp.save())
  }

  if(results.copyFontAwesome!=null && (!results.copyFontAwesome.length || promisePrompt.isLikeTrue(results.copyFontAwesome))){
    promise = promise
    .then(()=>log('Cloning font-awesome from node_modules folder into asset folder...'))
    .then( ()=>promiseSpawn(['npm','run','copy:fonts'], {log:log}) )
  }

  return promise
}

runPrompts()
.then(processPrompts)
.catch(e=>{
  if(e.message=='canceled'){
    console.log();
    return
  }
  log.error(e)
})
