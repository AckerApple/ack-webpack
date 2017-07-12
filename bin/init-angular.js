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

function processPrompts(results){
  if(!results)return;

  let promise = Promise.resolve()

  const appRoot = path.join(process.cwd(), results.appRoot)
  const tsOptions = {
    paramTsAotConfig : !results.paramTsAotConfig.length || promisePrompt.isLikeTrue(results.paramTsAotConfig),
    paramTsConfig    : !results.paramTsConfig.length || promisePrompt.isLikeTrue(results.paramTsConfig),
    createTypings    : !results.createTypings.length || promisePrompt.isLikeTrue(results.createTypings)
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

  if(!results['reflect-metadata'].length || promisePrompt.isLikeTrue(results['reflect-metadata'])){
    promise = promise.then( ()=>promiseSpawn.installPacks(['reflect-metadata']) )
  }

  if(!results['rxjs'].length || promisePrompt.isLikeTrue(results['rxjs'])){
    promise = promise.then( ()=>promiseSpawn.installPacks(['rxjs']) )
  }

  if(!results['zone.js'].length || promisePrompt.isLikeTrue(results['zone.js'])){
    promise = promise.then( ()=>promiseSpawn.installPacks(['zone.js']) )
  }

  if(!results['@angular/core'].length || promisePrompt.isLikeTrue(results['@angular/core'])){
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/core']) )
  }

  if(!results['@angular/common'].length || promisePrompt.isLikeTrue(results['@angular/common'])){
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/common']) )
  }

  if(!results['@angular/compiler'].length || promisePrompt.isLikeTrue(results['@angular/compiler'])){
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/compiler']) )
  }

  if(!results['@angular/compiler-cli'].length || promisePrompt.isLikeTrue(results['@angular/compiler-cli'])){
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/compiler-cli']) )
  }

  if(!results['@angular/platform-browser'].length || promisePrompt.isLikeTrue(results['@angular/platform-browser'])){
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/platform-browser']) )
  }

  if(!results['@angular/platform-browser-dynamic'].length || promisePrompt.isLikeTrue(results['@angular/platform-browser-dynamic'])){
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/platform-browser-dynamic']) )
  }

  if(!results['@angular/http'].length || promisePrompt.isLikeTrue(results['@angular/http'])){
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/http']) )
  }

  if(!results['@angular/router'].length || promisePrompt.isLikeTrue(results['@angular/router'])){
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/router']) )
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
