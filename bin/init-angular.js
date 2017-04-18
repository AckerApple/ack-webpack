const ackPath = require('ack-path')
const promiseSpawn = require('../promiseSpawn.function')
const install = require('../install.function')
const path = require('path')
const fs = require('fs')
const log = require("../log.function")
const promisePrompt = require('../promisePrompt.function')

const tsConfig = require('./lib/tsconfig.es5.json')
const tsAotConfig = require('./lib/tsconfig.es5.aot.json')
const typingsConfig = fs.readFileSync(path.join(__dirname,'lib','typings.d.ts')).toString()

function runPrompts(){
  return runBooleanPrompts()
  .then(processBooleanPrompts)
}

function runBooleanPrompts(){
  return promisePrompt([{
    description:'app root location?',
    name:'appRoot',
    default:'./app/'
  },{
    description:'Param tsconfig.json?',
    name:'paramTsConfig',
    default:'yes'
  },{
    description:'Param tsconfig.aot.json?',
    name:'paramTsAotConfig',
    default:'yes'
  },{
    description:'Param typings.d.ts?',
    name:'createTypings',
    default:'yes'
  },{
    description:'Intall reflect-metadata?',
    name:'reflect-metadata',
    default:'yes'
  },{
    description:'Intall rxjs?',
    name:'rxjs',
    default:'yes'
  },{
    description:'Intall zone.js?',
    name:'zone.js',
    default:'yes'
  },{
    description:'Intall @angular/core?',
    name:'@angular/core',
    default:'yes'
  },{
    description:'Intall @angular/common?',
    name:'@angular/common',
    default:'yes'
  },{
    description:'Intall @angular/compiler?',
    name:'@angular/compiler',
    default:'yes'
  },{
    description:'Intall @angular/compiler-cli?',
    name:'@angular/compiler-cli',
    default:'yes'
  },{
    description:'Intall @angular/platform-browser?',
    name:'@angular/platform-browser',
    default:'yes'
  },{
    description:'Intall @angular/platform-browser-dynamic?',
    name:'@angular/platform-browser-dynamic',
    default:'yes'
  },{
    description:'Intall @angular/router?',
    name:'@angular/router',
    default:'yes'
  },{
    description:'Intall @angular/http?',
    name:'@angular/http',
    default:'yes'
  }])
}

function isLikeTrue(v){
  if(v.toLowerCase())v=v.toLowerCase()
  return v=='yes' || v=='true' || v=='1'
}

function processBooleanPrompts(results){
  if(!results)return;

  let promise = Promise.resolve()

  const appRoot = path.join(process.cwd(), results.appRoot)
  const tsOptions = {
    paramTsAotConfig : !results.paramTsAotConfig.length || isLikeTrue(results.paramTsAotConfig),
    paramTsConfig    : !results.paramTsConfig.length || isLikeTrue(results.paramTsConfig),
    createTypings    : !results.createTypings.length || isLikeTrue(results.createTypings)
  }

  if(tsOptions.paramTsConfig || tsOptions.paramTsAotConfig || tsOptions.createTypings){
    promise = promise.then( ()=>ackPath(appRoot).param() )
  }

  if(tsOptions.paramTsConfig){
    promise = promise.then( ()=>paramTsConfig(appRoot, tsOptions) )
  }

  if(tsOptions.paramTsAotConfig){
    promise = promise.then( ()=>paramTsAotConfig(appRoot, tsOptions) )
  }

  if(tsOptions.createTypings){
    promise = promise.then( ()=>createTypings(appRoot, tsOptions) )
  }

  if(!results['reflect-metadata'].length || isLikeTrue(results['reflect-metadata'])){
    promise = promise.then( ()=>installPacks(['reflect-metadata']) )
  }

  if(!results['rxjs'].length || isLikeTrue(results['rxjs'])){
    promise = promise.then( ()=>installPacks(['rxjs']) )
  }

  if(!results['zone.js'].length || isLikeTrue(results['zone.js'])){
    promise = promise.then( ()=>installPacks(['zone.js']) )
  }

  if(!results['@angular/core'].length || isLikeTrue(results['@angular/core'])){
    promise = promise.then( ()=>installPacks(['@angular/core']) )
  }

  if(!results['@angular/common'].length || isLikeTrue(results['@angular/common'])){
    promise = promise.then( ()=>installPacks(['@angular/common']) )
  }

  if(!results['@angular/compiler'].length || isLikeTrue(results['@angular/compiler'])){
    promise = promise.then( ()=>installPacks(['@angular/compiler']) )
  }

  if(!results['@angular/compiler-cli'].length || isLikeTrue(results['@angular/compiler-cli'])){
    promise = promise.then( ()=>installPacks(['@angular/compiler-cli']) )
  }

  if(!results['@angular/platform-browser'].length || isLikeTrue(results['@angular/platform-browser'])){
    promise = promise.then( ()=>installPacks(['@angular/platform-browser']) )
  }

  if(!results['@angular/platform-browser-dynamic'].length || isLikeTrue(results['@angular/platform-browser-dynamic'])){
    promise = promise.then( ()=>installPacks(['@angular/platform-browser-dynamic']) )
  }

  if(!results['@angular/http'].length || isLikeTrue(results['@angular/http'])){
    promise = promise.then( ()=>installPacks(['@angular/http']) )
  }

  if(!results['@angular/router'].length || isLikeTrue(results['@angular/router'])){
    promise = promise.then( ()=>installPacks(['@angular/router']) )
  }

  return promise
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


function paramTsConfig(appRoot, options){
  const filePath = path.join(appRoot,'tsconfig.json')
  const exists = fs.existsSync( filePath )
  if(exists)return
  const config = tsConfig
  if(options && options.createTypings){
    config.files = config.files || []
    config.files.push('typings.d.ts')
  }
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2))
  log('created',filePath)
}

function paramTsAotConfig(appRoot, options){
  const filePath = path.join(appRoot,'tsconfig.aot.json')
  const exists = fs.existsSync( filePath )
  if(exists)return
  const config = tsAotConfig
  if(options && options.createTypings){
    config.files = config.files || []
    config.files.push('typings.d.ts')
  }
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2))
  log('created',filePath)
}

function createTypings(appRoot, options){
  const filePath = path.join(appRoot,'typings.d.ts')
  const exists = fs.existsSync( filePath )
  if(exists)return
  fs.writeFileSync(filePath, typingsConfig)
  log('created',filePath)
}
