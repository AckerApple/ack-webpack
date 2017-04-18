const promiseSpawn = require('../promiseSpawn.function')
const install = require('../install.function')
const path = require('path')
const fs = require('fs')
const log = require("../log.function")

//const jsonPacks = ['json-loader']
const typesPacks = ['typescript','ts-loader','core-js']
const babelPacks = ['babel-core','babel-preset-es2015','babel-loader']
const pugPacks = ['pug','pug-loader']
const webPacks = ['webpack']

const promisePrompt = require('../promisePrompt.function')

//const tsConfig = require('./tsconfig.es5.json')

function runPrompts(){
  return runBooleanPrompts()
  .then(processBooleanPrompts)
}

function runBooleanPrompts(){
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

function isLikeTrue(v){
  if(v.toLowerCase())v=v.toLowerCase()
  return v=='yes' || v=='true' || v=='1'
}

function processBooleanPrompts(results){
  if(!results)return;

  const useWebpack = !results.useWebpack.length || isLikeTrue(results.useWebpack)
  const usePug = !results.usePug.length || isLikeTrue(results.usePug)
  //const useJson = !results.useJson.length || isLikeTrue(results.useJson)
  const useTran = !results.useTran.length || isLikeTrue(results.useTran)
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
  let promise = installPacks(typesPacks)//.then(()=>paramTsConfig(options))

  /*if(options.ngToolsWebpack){
    promise.then(()=>installer('@ngtools/webpack'))
  }*/

  return promise
}

/*function getTsConfigPath(){
  return path.join(process.cwd(),'tsconfig.json')
}

function paramTsConfig(options){
  const tsConfigPath = getTsConfigPath()
  return new Promise(function(res,rej){
    fs.readFile(tsConfigPath,function(err,buff){
      err ? createTsConfig(options) : res()
    })
  })
}

function createTsConfig(options={}){
  return new Promise((res,rej)=>{
    fs.writeFile(getTsConfigPath(), JSON.stringify(tsConfig, null, 2), (err)=>{
      err ? rej(err) : res()
    })
  })
  .then(()=>log("ack-webpack: created tsconfig.json"))
}*/

function installBabel(){
  return installPacks(babelPacks)
}

/*function installJson(){
  return installPacks(jsonPacks)
}*/

function installPug(){
  return installPacks(pugPacks)
}

function installWebpack(){
  return installPacks(webPacks)
}

function installPacks(packs){
  let promise = Promise.resolve()
  packs.forEach( pack=>promise=promise.then(()=>installer(pack)) )
  return promise
}

function installer(name){
  const args = ['npm','install',name,'--save-dev']
  log('$',args.join(' '))
  return promiseSpawn(args)
}

runPrompts()
.catch(e=>{
  if(e.message=='canceled'){
    console.log();
    return
  }
  log.error(e)
})