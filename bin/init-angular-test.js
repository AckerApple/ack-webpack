const ackPath = require('ack-path')
const promiseSpawn = require('../promiseSpawn.function')
const install = require('../install.function')
const path = require('path')
const fs = require('fs')
const log = require("../log.function")
const promisePrompt = require('../promisePrompt.function')
const PackHelp = require('./package.help.js')
const ackPackHelp = new (require('./ack-package.help'))()
const packHelp = new PackHelp()
const defaultAppRoot = path.join('app','src')

function runPrompts(){
  const schema = []

  schema.push.apply(schema, getInstallSchema())

  return promisePrompt(schema)
}

function getInstallSchema(){
  const schema = []

  if( !promiseSpawn.isModuleInstalled('phantomjs-prebuilt') ){
    schema.push({
      description:'Intall phantomjs-prebuilt?',
      name:'phantomjs-prebuilt',
      default:'yes'
    })
  }

  if( !promiseSpawn.isModuleInstalled('jasmine') ){
    schema.push({
      description:'Intall jasmine?',
      name:'jasmine',
      default:'yes'
    })
  }

  if( !promiseSpawn.isModuleInstalled('@types/jasmine') ){
    schema.push({
      description:'Intall @types/jasmine?',
      name:'@types/jasmine',
      default:'yes'
    })
  }

  if( !promiseSpawn.isModuleInstalled('karma') ){
    schema.push({
      description:'Intall karma?',
      name:'karma',
      default:'yes'
    })
  }

  if( !promiseSpawn.isModuleInstalled('karma-jasmine') ){
    schema.push({
      description:'Intall karma-jasmine?',
      name:'karma-jasmine',
      default:'yes'
    })
  }

  if( !promiseSpawn.isModuleInstalled('karma-jasmine-html-reporter') ){
    schema.push({
      description:'Intall karma-jasmine-html-reporter?',
      name:'karma-jasmine-html-reporter',
      default:'yes'
    })
  }

  if( !promiseSpawn.isModuleInstalled('karma-phantomjs-launcher') ){
    schema.push({
      description:'Intall karma-phantomjs-launcher?',
      name:'karma-phantomjs-launcher',
      default:'yes'
    })
  }

  if( !promiseSpawn.isModuleInstalled('karma-chrome-launcher') ){
    schema.push({
      description:'Intall karma-chrome-launcher?',
      name:'karma-chrome-launcher',
      default:'yes'
    })
  }

  if( !promiseSpawn.isModuleInstalled('karma-coverage-istanbul-reporter') ){
    schema.push({
      description:'Intall karma-coverage-istanbul-reporter?',
      name:'karma-coverage-istanbul-reporter',
      default:'yes'
    })
  }

  if( !promiseSpawn.isModuleInstalled('@angular/cli') ){
    schema.push({
      description:'Intall @angular/cli?',
      name:'@angular/cli',
      default:'yes'
    })
  }

  if( !promiseSpawn.isModuleInstalled('ts-helpers') ){
    schema.push({
      description:'Intall ts-helpers?',
      name:'ts-helpers',
      default:'yes'
    })
  }

  if( !promiseSpawn.isModuleInstalled('core-js') ){
    schema.push({
      description:'Intall core-js?',
      name:'core-js',
      default:'yes'
    })
  }

  if( !promiseSpawn.isModuleInstalled('classlist-polyfill') ){
    schema.push({
      description:'Intall classlist-polyfill?',
      name:'classlist-polyfill',
      default:'yes'
    })
  }

  if( !promiseSpawn.isModuleInstalled('zone.js') ){
    schema.push({
      description:'Intall zone.jsl?',
      name:'zone.js',
      default:'yes'
    })
  }

  if( !promiseSpawn.isModuleInstalled('@angular/platform-browser-dynamic') ){
    schema.push({
      description:'Intall @angular/platform-browser-dynamic?',
      name:'@angular/platform-browser-dynamic',
      default:'yes'
    })
  }

  if( !promiseSpawn.isModuleInstalled('@angular/core') ){
    schema.push({
      description:'Intall @angular/core?',
      name:'@angular/core',
      default:'yes'
    })
  }

  schema.push.apply(schema, getScriptsSchema())
  schema.push.apply(schema, getAssetSchema())

  return schema
}

function processAssetPrompt(results){
  let promise = Promise.resolve()
  const appRoot = process.cwd()//todo, needs to come from config
  
  if( promisePrompt.isLikeTrue(results.writeAngularCliJson) ){
    promise = promise.then( ()=>writeAngularCliJson(appRoot) )
  }
  
  if( promisePrompt.isLikeTrue(results.writeKarmaConfig) ){
    promise = promise.then( ()=>writeKarmaConfig(appRoot) )
  }
  
  if( promisePrompt.isLikeTrue(results.paramTestFolder) ){
    promise = promise.then( ()=>paramTestFolder(appRoot) )
  }

  return promise
}

function paramTestFolder(appRoot){
  //get ack-webpack built-in tools path
  const copyPath = path.join(__dirname,'lib','angular-test','test-tools')

  //get paste test-tools path
  const folderPath = path.join(appRoot,'test')
  
  const exists = fs.existsSync( folderPath )
  if(!exists){
    return ackPath(copyPath).copyTo(folderPath)
  }
  
  const files = [
    "sauce-browsers.js",
    "test.ts",
    "tsconfig.json",
    "polyfills.ts",
    "main.ts",
    "index.html",
    "app.module.ts"
  ]

  const promises = files.map(file=>{
    const copyPath = path.join(__dirname,'lib','angular-test','test',file)
    const pastePath = path.join(__dirname,'test',file)
    const ackFile = ackPath( copyPath )
    return ackFile.File()
    .exists()
    .if(false,()=>{
      return ackFile.copyTo(pastePath)
      .then( ()=>log('created',pastePath) )
    })
  })

  return Promise.all(promises)
}

function writeAngularCliJson(appRoot){
  const filePath = path.join(appRoot,'.angular-cli.json')
  const exists = fs.existsSync( filePath )
  if(exists)return
  
  const config = require('./lib/angular-test/.angular-cli.json')
  //config.project.name = package.name
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2))
  log('created',filePath)
}

function writeKarmaConfig(appRoot){
  const filePath = path.join(appRoot,'karma.conf.js')
  const exists = fs.existsSync( filePath )
  if(exists)return
  
  const config = require('./lib/angular-test/karma.conf.js')
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2))
  log('created',filePath)
}

function getAssetSchema(){
  const schema = [{
    description:'Create default .angular-cli.json?',
    name:'writeAngularCliJson',
    default:'yes',
    ask:()=>!fs.existsSync( path.join(process.cwd(), '.angular-cli.json') )
  },{
    description:'Create default karma.conf.js?',
    name:'writeKarmaConfig',
    default:'yes',
    ask:()=>!fs.existsSync( path.join(process.cwd(), 'karma.conf.js') )
  },{
    description:'Param test folder?',
    name:'paramTestFolder',
    default:!fs.existsSync( path.join(process.cwd(), 'test' ) )
  }]

  return schema
}

function getScriptsSchema(){
  const schema = []

  schema.push({
    description:'Would you like to choose convenience scripts to add to package.json?',
    name:'addScripts',
    default:'yes'
  })

  if( !packHelp.scriptDefined("test") ){
    schema.push({
      description:'Add test convenient script to npm package',
      name:'addTestScript',
      default:'yes',
      ask: isPerformScripts
    })
  }

  if( !packHelp.scriptDefined("test:watch") ){
    schema.push({
      description:'Add test:watch convenient script to npm package',
      name:'addTestWatchScript',
      default:'yes',
      ask: isPerformScripts
    })
  }

  return schema
}

function isPerformScripts(){
  return promisePrompt.historyValueLikeTrue('addScripts')
}

function processPrompts(results){
  if(!results)return Promise.resolve()
  return performInstalls(results)
  .then( ()=>processAssetPrompt(results) )
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

  if(promisePrompt.isLikeTrue(results['phantomjs-prebuilt'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['phantomjs-prebuilt']) )
  }

  if(promisePrompt.isLikeTrue(results['jasmine'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['jasmine']) )
  }

  if(promisePrompt.isLikeTrue(results['@types/jasmine'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['@types/jasmine']) )
  }

  if(promisePrompt.isLikeTrue(results['karma'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['karma']) )
  }

  if(promisePrompt.isLikeTrue(results['karma-jasmine'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['karma-jasmine']) )
  }

  if(promisePrompt.isLikeTrue(results['karma-jasmine-html-reporter'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['karma-jasmine-html-reporter']) )
  }

  if(promisePrompt.isLikeTrue(results['karma-phantomjs-launcher'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['karma-phantomjs-launcher']) )
  }

  if(promisePrompt.isLikeTrue(results['karma-chrome-launcher'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['karma-chrome-launcher']) )
  }

  if(promisePrompt.isLikeTrue(results['karma-coverage-istanbul-reporter'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['karma-coverage-istanbul-reporter']) )
  }

  if(promisePrompt.isLikeTrue(results['@angular/cli'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/cli']) )
  }

  if(promisePrompt.isLikeTrue(results['ts-helpers'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['ts-helpers']) )
  }

  if(promisePrompt.isLikeTrue(results['core-js'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['core-js']) )
  }

  if(promisePrompt.isLikeTrue(results['classlist-polyfill'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['classlist-polyfill']) )
  }

  if(promisePrompt.isLikeTrue(results['zone.js'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['zone.js']) )
  }

  if(promisePrompt.isLikeTrue(results['@angular/platform-browser-dynamic'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/platform-browser-dynamic']) )
  }

  if(promisePrompt.isLikeTrue(results['@angular/core'])){
    ++installCount
    promise = promise.then( ()=>promiseSpawn.installPacks(['@angular/core']) )
  }

  if(installCount==0){
    log('You have every Angular test package, available here, already installed. No Installs to Perform.')
  }

  let packChanged = false
  if( promisePrompt.isLikeTrue(results['addTestScript']) ){
    packChanged = true
    packHelp.setScript(
      "test",
      "ng test --browser PhantomJS --single-run",
      "Tests angular app using karama and jasmine"
    )
    log('Created package.json test script')
  }

  if( promisePrompt.isLikeTrue(results['addTestWatchScript']) ){
    packChanged = true
    packHelp.setScript(
      "test:watch",
      "ng test",
      "Opens local browser to test angular app"
    )
    log('Created package.json test:watch script')
  }

  if( packChanged ){
    packHelp.save()
  }

  return promise
  .then( ()=>ackPackHelp.updatePrompt("init:angular:test", results).save() )
  .then( ()=>log('You can now create spec files within the /src folder') )
}

