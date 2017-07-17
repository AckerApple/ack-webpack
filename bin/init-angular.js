const ackPath = require('ack-path')
const promiseSpawn = require('../promiseSpawn.function')
const install = require('../install.function')
const path = require('path')
const fs = require('fs')
const log = require("../log.function")
const promisePrompt = require('../promisePrompt.function')

const tsConfig = require('./lib/angular/tsconfig.es5.json')
const tsAotConfig = require('./lib/angular/tsconfig.es5.aot.json')
const typingsConfig = fs.readFileSync(path.join(__dirname,'lib','angular','typings.d.ts')).toString()
const defaultAppRoot = path.join('app','src')

function appSrcNeeded(){
  const typings = promisePrompt.prompt.history('createTypings').value
  const paramTsConfig = promisePrompt.prompt.history('paramTsConfig').value
  const paramTsAotConfig = promisePrompt.prompt.history('paramTsAotConfig').value
  
  return promisePrompt.isLikeTrue(typings)
  || promisePrompt.isLikeTrue(paramTsConfig)
  || promisePrompt.isLikeTrue(paramTsAotConfig)
}

function runPrompts(){
  const schema = []
  /*[{
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
    description:'App root src location?',
    name:'appRoot',
    default:defaultAppRoot,
    ask:appSrcNeeded
  },{
    description:'Would you like to choose angular packages to install?',
    name:'performInstalls',
    default:'yes'
  }]*/

  schema.push.apply(schema, getInstallSchema())

  return promisePrompt(schema)
}


function isPerformInstalls(){
  return true
  //return promisePrompt.historyValueLikeTrue('performInstalls')
}

function getInstallSchema(){
  const schema = []

  if( !promiseSpawn.isModuleInstalled('reflect-metadata') ){
    schema.push({
      description:'Intall reflect-metadata?',
      name:'reflect-metadata',
      default:'yes',
      ask:isPerformInstalls
    })
  }

  if( !promiseSpawn.isModuleInstalled('rxjs') ){
    schema.push({
      description:'Intall rxjs?',
      name:'rxjs',
      default:'yes',
      ask:isPerformInstalls
    })
  }

  if( !promiseSpawn.isModuleInstalled('zone.js') ){
    schema.push({
      description:'Intall zone.js?',
      name:'zone.js',
      default:'yes',
      ask:isPerformInstalls
    })
  }

  if( !promiseSpawn.isModuleInstalled('@angular/core') ){
    schema.push({
      description:'Intall @angular/core?',
      name:'@angular/core',
      default:'yes',
      ask:isPerformInstalls
    })
  }

  if( !promiseSpawn.isModuleInstalled('@angular/common') ){
    schema.push({
      description:'Intall @angular/common?',
      name:'@angular/common',
      default:'yes',
      ask:isPerformInstalls
    })
  }

  if( !promiseSpawn.isModuleInstalled('@angular/compiler') ){
    schema.push({
      description:'Intall @angular/compiler?',
      name:'@angular/compiler',
      default:'yes',
      ask:isPerformInstalls
    })
  }

  if( !promiseSpawn.isModuleInstalled('@angular/compiler-cli') ){
    schema.push({
      description:'Intall @angular/compiler-cli?',
      name:'@angular/compiler-cli',
      default:'yes',
      ask:isPerformInstalls
    })
  }

  if( !promiseSpawn.isModuleInstalled('@angular/platform-browser') ){
    schema.push({
      description:'Intall @angular/platform-browser?',
      name:'@angular/platform-browser',
      default:'yes',
      ask:isPerformInstalls
    })
  }

  if( !promiseSpawn.isModuleInstalled('@angular/platform-browser-dynamic') ){
    schema.push({
      description:'Intall @angular/platform-browser-dynamic?',
      name:'@angular/platform-browser-dynamic',
      default:'yes',
      ask:isPerformInstalls
    })
  }

  if( !promiseSpawn.isModuleInstalled('@angular/forms') ){
    schema.push({
      description:'Intall @angular/forms?',
      name:'@angular/forms',
      default:'yes',
      ask:isPerformInstalls
    })
  }

  if( !promiseSpawn.isModuleInstalled('@angular/router') ){
    schema.push({
      description:'Intall @angular/router?',
      name:'@angular/router',
      default:'yes',
      ask:isPerformInstalls
    })
  }

  if( !promiseSpawn.isModuleInstalled('@angular/animations') ){
    schema.push({
      description:'Intall @angular/animations?',
      name:'@angular/animations',
      default:'yes',
      ask:isPerformInstalls
    })
  }

  if( !promiseSpawn.isModuleInstalled('@angular/http') ){
    schema.push({
      description:'Intall @angular/http?',
      name:'@angular/http',
      default:'yes',
      ask:isPerformInstalls
    })
  }

  return schema
}

function processPrompts(results){
  if(!results)return;

  let promise = Promise.resolve()

  /*
  const appRoot = path.join(process.cwd(), results.appRoot)
  const tsOptions = {
    paramTsAotConfig : promisePrompt.isLikeTrue(results.paramTsAotConfig),
    paramTsConfig    : promisePrompt.isLikeTrue(results.paramTsConfig),
    createTypings    : promisePrompt.isLikeTrue(results.createTypings)
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

  if(promisePrompt.isLikeTrue(results.performInstalls)){
    promise = performInstalls(results)
  }*/

  promise = performInstalls(results)

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

function performInstalls(results){
  let promise = Promise.resolve()
  let installCount = 0

  if(promisePrompt.isLikeTrue(results['reflect-metadata'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['reflect-metadata']) )
  }

  if(promisePrompt.isLikeTrue(results['rxjs'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['rxjs']) )
  }

  if(promisePrompt.isLikeTrue(results['zone.js'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['zone.js']) )
  }

  if(promisePrompt.isLikeTrue(results['@angular/core'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/core']) )
  }

  if(promisePrompt.isLikeTrue(results['@angular/common'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/common']) )
  }

  if(promisePrompt.isLikeTrue(results['@angular/compiler'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/compiler']) )
  }

  if(promisePrompt.isLikeTrue(results['@angular/compiler-cli'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/compiler-cli']) )
  }

  if(promisePrompt.isLikeTrue(results['@angular/platform-browser'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/platform-browser']) )
  }

  if(promisePrompt.isLikeTrue(results['@angular/platform-browser-dynamic'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/platform-browser-dynamic']) )
  }

  if(promisePrompt.isLikeTrue(results['@angular/http'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/http']) )
  }

  if(promisePrompt.isLikeTrue(results['@angular/router'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/router']) )
  }

  if(promisePrompt.isLikeTrue(results['@angular/animations'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/animations']) )
  }

  if(installCount==0){
    log('You have every Angular package, available here, already installed. No Installs to Perform.')
  }

  return promise
}