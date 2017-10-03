const promiseSpawn = require('../promiseSpawn.function')
const install = require('../install.function')
const path = require('path')
const fs = require('fs')
const log = require("../log.function")
const ackPackHelp = new (require('./ack-package.help'))()

//const jsonPacks = ['json-loader']
const typesPacks = ['typescript','ts-loader','core-js']
const babelPacks = ['babel-core','babel-preset-es2015','babel-loader']
const pugPacks = ['pug','pug-loader','pug-cli']
const webPacks = ['webpack']

const promisePrompt = require('../promisePrompt.function')

function runPrompts(){
  return promisePrompt([{
    description:'Intall webpack?',
    name:'useWebpack',
    default:'yes'
  }/*,{
    description:'Do you wish to enable JSON file import?',
    name:'useJson',
    default:'yes'
  }*/,{
    description:'Enable PUG/JADE template-file import?',
    name:'usePug',
    default:'yes'
  },{
    description:'Using a transpiler?',
    name:'useTran',
    default:'yes'
  }])
}

function processPrompts(results){
  if(!results)return;

  const useWebpack = promisePrompt.isLikeTrue(results.useWebpack)
  const usePug = promisePrompt.isLikeTrue(results.usePug)
  //const useJson = promisePrompt.isLikeTrue(results.useJson)
  const useTran = promisePrompt.isLikeTrue(results.useTran)
  var tranPromptRes = null
  let promise = Promise.resolve()

  if(useTran){//ask transpiler choice first before installs
    promise = promise.then(runTransPrompt).then(res=>tranPromptRes=res)
  }

  if(useWebpack){
    promise = promise.then(installWebpack)
  }

  if(useTran){//webpack must already be installed, now we can process tran prompt
    promise = promise.then( ()=>processTranPrompt(tranPromptRes) )
  }

  /*if(useJson){
    promise = promise.then(installJson)
  }*/

  if(usePug){
    promise = promise.then(installPug)
  }

  return promise
  .then( ()=>ackPackHelp.updatePrompt("init", results).save() )
}

function runTransPrompt(){
  const config = {}

  return promisePrompt([{
    description:'Which ES6 transpiler would you like to use, Babel or TypeScript?',
    name:'transpiler',
    default:'typescript'//'babel'
  }])
  .then(results=>{
    Object.assign(config, results)
    return config
  })
  /* Decide if we want @ngtools/webpack and/or tsconfig file pathing
  .then(()=>{
    if(config.transpiler.toLowerCase()=='typescript'){
      return runTypescriptPrompt()
    }
  })
  .then(tResults=>{
    if(tResults)Object.assign(config, tResults)

    return config
  })*/
}

function processTranPrompt(results){
  switch(results.transpiler.toLowerCase()){
    case 'babel':return installBabel(results)
    default:return installTypescript(results)
  }
}

function runTypescriptPrompt(){
  return promisePrompt([{
    description:'Install @ngtools/webpack for AoT Support',
    name:'ngToolsWebpack',
    default:'yes'
  },{
    description:'Typescript index path',
    name:'indexPath',
    default:'index.ts'
  }])
}

function installTypescript(options){
  return promiseSpawn.installPacks(typesPacks)
}

function installBabel(){
  return promiseSpawn.installPacks(babelPacks)
}

function installPug(){
  return promiseSpawn.installPacks(pugPacks)
}

function installWebpack(){
  return promiseSpawn.installPacks(webPacks)
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