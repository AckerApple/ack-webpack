const promiseSpawn = require('./promiseSpawn.function')
const path = require('path')
const fs = require('fs')
const prompt = require('prompt')
const jsonPacks = ['json-loader']
const typesPacks = ['typescript','ts-loader']
const babelPacks = ['babel-core','babel-loader','babel-preset-es2015']
const pugPacks = ['pug','pug-loader']
const webPacks = ['webpack']

function promisePrompt(scheme){
  return new Promise(function(res,rej){
    prompt.message = 'ack-webpack'
    prompt.start()
    prompt.get(scheme, function(err, result){
      err ? rej(err) : res(result)
    })
  })
}

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
  return promisePrompt([{
    description:'Which ES6 transpiler would you like to use, Babel or TypeScript?',
    name:'transpiler',
    default:'typescript'
  }])
}

function processTranPrompt(results){
  switch(results.transpiler.toLowerCase()){
    case 'babel':return installBabel()
    default:return installTypescript()
  }
}

function installTypescript(){
  return installPacks(typesPacks).then( paramTsConfig )
}

function getTsConfigPath(){
  return path.join(process.cwd(),'tsconfig.json')
}

function paramTsConfig(){
  const tsConfigPath = getTsConfigPath()
  return new Promise(function(res,rej){
    fs.readFile(tsConfigPath,function(err,buff){
      err ? createTsConfig() : res()
    })
  })
}

function createTsConfig(){
  const tsConfig = {
    "compilerOptions": {
      "module": "commonjs"
    },
    "files": [
      "index.ts"
    ]
  }
  return new Promise((res,rej)=>{
    fs.writeFile(getTsConfigPath(), JSON.stringify(tsConfig, null, 2), (err)=>{
      err ? rej(err) : res()
    })
  })
  .then(()=>console.log("ack-webpack: created tsconfig.json"))
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
  console.log('$',args.join(' '))
  return promiseSpawn(args)
}

runPrompts()
.catch(e=>{
  if(e.message=='canceled'){
    console.log();
    return
  }
  console.error(e)
})