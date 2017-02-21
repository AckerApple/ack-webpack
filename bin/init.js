const promiseSpawn = require('../promiseSpawn.function')
const path = require('path')
const fs = require('fs')
const log = require("../log.function");

const jsonPacks = ['json-loader']
const typesPacks = ['typescript','ts-loader']
const babelPacks = ['babel-core','babel-preset-es2015','babel-loader']
const pugPacks = ['pug','pug-loader']
const webPacks = ['webpack']

const promisePrompt = require('../promisePrompt.function')

function runPrompts(){
  return runBooleanPrompts()
  .then(processBooleanPrompts)
}

function runBooleanPrompts(){
  return promisePrompt([{
    description:'Do you wish to intall webpack?',
    name:'useWebpack',
    default:'yes'
  },{
    description:'Do you wish to enable JSON file import?',
    name:'useJson',
    default:'yes'
  },{
    description:'Do you wish to enable PUG/JADE template-file import?',
    name:'usePug',
    default:'yes'
  },{
    description:'Do you wish to use a transpiler?',
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
  const useJson = !results.useJson.length || isLikeTrue(results.useJson)
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

  if(useJson){
    promise = promise.then(installJson)
  }

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
    default:'typescript'
  }])
  .then(results=>{
    Object.assign(config, results)
  })
  .then(()=>{
    if(config.transpiler.toLowerCase()=='typescript'){
      return runTypescriptPrompt()
    }
  })
  .then(tResults=>{
    if(tResults)Object.assign(config, tResults)

    return config
  })
}

function processTranPrompt(results){
  switch(results.transpiler.toLowerCase()){
    case 'babel':return installBabel(results)
    default:return installTypescript(results)
  }
}

function runTypescriptPrompt(){
  return promisePrompt([{
    description:'Typescript index path',
    name:'indexPath',
    default:'index.ts'
  }])
}

function installTypescript(options){
  return installPacks(typesPacks).then(()=>paramTsConfig(options))
}

function getTsConfigPath(){
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
  const tsConfig = {
    "compilerOptions": {
      "module": "commonjs"
    },
    "files": [
      options.indexPath || "index.ts"
    ]
  }
  return new Promise((res,rej)=>{
    fs.writeFile(getTsConfigPath(), JSON.stringify(tsConfig, null, 2), (err)=>{
      err ? rej(err) : res()
    })
  })
  .then(()=>log("ack-webpack: created tsconfig.json"))
}

function installBabel(){
  return installPacks(babelPacks)
}

function installJson(){
  return installPacks(jsonPacks)
}

function installPug(){
  return installPacks(pugPacks)
}

function installWebpack(){
  return installPacks(webPacks)
}

function installPacks(packs){
  let promise = Promise.resolve()
  packs.forEach( pack=>promise=promise.then(()=>install(pack)) )
  return promise
}

function install(name){
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