const ackPath = require('ack-path')
const promiseSpawn = require('../promiseSpawn.function')
const install = require('../install.function')
const path = require('path')
const fs = require('fs')
const log = require("../log.function")
const promisePrompt = require('../promisePrompt.function')
const PackHelp = require('./package.help.js')
const packHelp = new PackHelp()
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
      ask: ()=>promisePrompt.isLikeTrue( promisePrompt.prompt.history('addScripts').value )
    })
  }

  schema.push({
    description:'Run script to clone font-awesome to assets folder',
    name:'copyFontAwesome',
    default:'yes',
    ask: ()=>scriptDefined || promisePrompt.isLikeTrue( promisePrompt.prompt.history('addScripts').value )
  })

  return promisePrompt(schema)
}

function processPrompts(results){
  let promise = Promise.resolve()
  
  if(!results)return promise;

  if( promisePrompt.isLikeTrue(results.install) ){
    promise = promise.then( ()=>promiseSpawn.installPacks(['font-awesome']) )
  }

  const addScripts = results.addScripts!=null && promisePrompt.isLikeTrue(results.addScripts)
  if(addScripts){
    const assetPath = results.assetPath.length ? results.assetPath : assetDefaultPath
    const cssFileRef = path.join(assetPath, "css", "font-awesome.min.css")
    const fontFolderRef = path.join(assetPath, "fonts")
    
    packHelp.setScript(
      "copy:fonts",
      "npm-run-all -s copy:font-awesome:fonts copy:font-awesome:css",
      "Runs two commands to move font-awesome from node_modules into www output asset folder"
    )
    packHelp.setScript(
      "copy:font-awesome:css",
      "ack-path copy node_modules/font-awesome/css/font-awesome.min.css "+cssFileRef,
      "Clones font-awesome.min.css file from node_modules folder into www output asset folder"
    )
    packHelp.setScript(
      "copy:font-awesome:fonts",
      "ack-path copy node_modules/font-awesome/fonts "+fontFolderRef,
      "Clones font-awesome font files like .ttf and .woff like files from node_modules folder into www output asset folder"
    )

    if( !promiseSpawn.isModuleInstalled('ack-path') ){
      promise = promise
      .then( ()=>log('To handle copy/paste of font-awesome files, ack-path will be installed') )
      .then( ()=>promiseSpawn.installPacks(['ack-path']) )
    }
    
    if( !promiseSpawn.isModuleInstalled('npm-run-all') ){
      promise = promise
      .then( ()=>log('To handle running multiple scripts across any device, npm-run-all will be installed') )
      .then( ()=>promiseSpawn.installPacks(['npm-run-all']) )
    }
    
    promise = promise
    .then(()=>log('Saving package.json...'))
    .then(()=>packHelp.save())
  }

  if(results.copyFontAwesome!=null && promisePrompt.isLikeTrue(results.copyFontAwesome)){
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
