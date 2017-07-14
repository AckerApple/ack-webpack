const ackPath = require('ack-path')
const promiseSpawn = require('../promiseSpawn.function')
const install = require('../install.function')
const path = require('path')
const fs = require('fs')
const log = require("../log.function")
const promisePrompt = require('../promisePrompt.function')
const PackHelp = require('./package.help.js')
const packHelp = new PackHelp()

const prefxFilePath = path.join('app','src','prefx.ts')

function runPrompts(){
  const schema = [{
    description:'npm install ack-angular',
    name:'install',
    default:'yes'
  },{
    description:'npm install ack-angular-fx',
    name:'installFx',
    default:'yes'
  }]

  schema.push.apply(schema, getFxPromptSchema())

  return promisePrompt(schema)
}

function getFxPromptSchema(){
  const schema = []

  const fxScriptDefined = packHelp.scriptDefined("compile:prefx")
  if( !fxScriptDefined ){
    schema.push({
      description:'Add ack-angular-fx convenient scripts to npm package',
      name:'addFxScripts',
      default:'yes'
    })

    schema.push({
      description:'Enter prefx.ts output file path',
      name:'prefxFilePath',
      default:prefxFilePath,
      ask: ()=>promisePrompt.isLikeTrue( promisePrompt.prompt.history('addFxScripts').value )
    })
  }

  schema.push({
    description:'Run script to create ack-angular-fx prefx.ts file',
    name:'runPrefx',
    default:'yes',
    ask: ()=>fxScriptDefined || promisePrompt.isLikeTrue( promisePrompt.prompt.history('addFxScripts').value )
  })

  return schema
}

function processPrompts(results){
  let promise = Promise.resolve()
  
  if(!results)return promise;

  /* ack-angular-fx scripting */
    const addFxScripts = results.addFxScripts!=null && promisePrompt.isLikeTrue(results.addFxScripts)
    if(addFxScripts){
      const prefxFilePath = results.prefxFilePath
      
      packHelp.setScript(
        "compile:prefx",
        "ack-angular-fx --igniter void --select childStag,absoluteSwap,100,200,500,1000 --effects fade,slide,bounce --out " + prefxFilePath,
        "Creates resusable Angular animations defintions file that is compatible with AoT compilation"
      )
    }

    if(addFxScripts){
      promise = promise
      .then(()=>log('Saving package.json...'))
      .then(()=>packHelp.save())
    }

    /* installs : must come after package.json save */
      if( promisePrompt.isLikeTrue(results.install) ){
        promise = promise
        .then(()=>log('Installing ack-angular...'))
        .then( ()=>promiseSpawn.installPacks(['ack-angular']) )
      }

      if( promisePrompt.isLikeTrue(results.installFx) ){
        promise = promise
        .then(()=>log('Installing ack-angular-fx...'))
        .then( ()=>promiseSpawn.installPacks(['@angular/animations','ack-angular-fx']) )
      }
    /* end: installs */

    if( promisePrompt.isLikeTrue(results.runPrefx) ){
      promise = promise
      .then(()=>log('Creating ack-angular-fx prefx.ts file...'))
      .then( ()=>promiseSpawn(['npm','run','compile:prefx'], {log:log}) )
    }
  /* end : after run scripts */

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
