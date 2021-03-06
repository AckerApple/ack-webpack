const path = require('path')

//Very important paths
const appSrcPath = path.join('app','src')

const ackPath = require('ack-path')
const promiseSpawn = require('../promiseSpawn.function')
const install = require('../install.function')
const fs = require('fs')
const log = require("../log.function")
const promisePrompt = require('../promisePrompt.function')
const PackHelp = require('./package.help.js')
const packHelp = new PackHelp()
const ackPackHelp = new (require('./ack-package.help'))()
let indexInputPath = path.join('index.pug')

//config templates
const typingsConfig = fs.readFileSync(path.join(__dirname,'lib','ack-app','typings.d.ts')).toString()
const tsConfig = require('./lib/ack-app/tsconfig.es5.json')
const angularConfig = require('./lib/ack-app/angular.json')

function runPrompts(){
  const schema = [{
    description:'App src folder path',
    name:'appSrcPath',
    default:appSrcPath
  },{
    description:'Build output folder path',
    name:'buildPath',
    default: ()=>path.join(getAppSrcPath(), '../', 'dist/www')
  },{
    description:'NEVER RUNS, just captures buildPath value to memory incase too many questions cause it to be lossed',
    name:'buildPathMemory',
    ask: ()=>getBuildPath() && false
  }]

  schema.push.apply(schema, getAssetSchema())
  schema.push.apply(schema, getScriptsSchema())

  return promisePrompt(schema)
}

function getAssetSchema(){
  const schema = [{
    description:'Create default tsconfig.json?',
    name:'writeTsConfig',
    default:'yes',
    ask:()=>!fs.existsSync( path.join(process.cwd(), getAppSrcPath(), 'tsconfig.json') )
  },{
    description:'Create default angular.json?',
    name:'writeAngularJson',
    default:'yes',
    ask:()=>!fs.existsSync( path.join(process.cwd(), 'angular.json') )
  }/*,{
    description:'Create default tsconfig.aot.json?',
    name:'writeTsAotConfig',
    default:'yes',
    ask:()=>!fs.existsSync( path.join(process.cwd(), getAppSrcPath(), 'tsconfig.aot.json') )
  }*/,{
    description:'Create default typings.d.ts?',
    name:'createTypings',
    default:'yes',
    ask:()=>!fs.existsSync( path.join(process.cwd(), getAppSrcPath(), 'typings.d.ts') )
  }]
  
  //index.ts
  schema.push({
    description:'Create index.ts',
    name:'createIndexTs',
    default:'yes',
    ask:()=>!fs.existsSync( path.join(process.cwd(), getAppSrcPath(), 'index.ts') )
  })

  //index.aot.ts
  schema.push({
    description:'Create index.prod.ts',
    name:'createIndexProdTs',
    default:'yes',
    ask:()=>!fs.existsSync( path.join(process.cwd(), getAppSrcPath(), 'index.prod.ts') )
  })

  //app.module.ts
  schema.push({
    description:'Create app.module.ts',
    name:'createAppModuleTs',
    default:'yes',
    ask:()=>!fs.existsSync( path.join(process.cwd(), getAppSrcPath(), 'app.module.ts') )
  })

  return schema
}

function isPerformScripts(){
  return promisePrompt.historyValueLikeTrue('addScripts')
}

function getBuildPath(){
  return promisePrompt.historyValue('buildPath')
}

function getAppSrcPath(){
  return promisePrompt.historyValue('appSrcPath')
}

function getScriptsSchema(){
  const schema = []

  schema.push({
    description:'Would you like to choose convenience scripts to add to package.json?',
    name:'addScripts',
    default:'yes'
  })

  const compileScriptDefined = packHelp.scriptDefined("compile:templates")  
  if( !compileScriptDefined ){
    schema.push({
      description:'Add compile:templates convenient script to npm package',
      name:'addCompileTemplates',
      default:'yes',
      ask: isPerformScripts
    })
  }
  
  /*const compileAotDefined = packHelp.scriptDefined("compile:aot")
  if( !compileAotDefined ){
    schema.push({
      description:'Add compile:aot convenient script to npm package',
      name:'addCompileAot',
      default:'yes',
      ask: isPerformScripts
    })
  }*/
  
  const buildJsDefined = packHelp.scriptDefined("build:js")
  if( !buildJsDefined ){
    schema.push({
      description:'Add build:js convenient script to npm package',
      name:'addBuildJs',
      default:'yes',
      ask: isPerformScripts
    })

    //not sure if needed 7/4/18
    /*schema.push({
      description:'Enter index.js file path',
      name:'assetIndexFilePath',
      default: ()=>path.join(getBuildPath(), 'assets','scripts','index.js'),
      ask: ()=>isPerformScripts() && promisePrompt.historyValueLikeTrue('addBuildJs')
    })*/

    if( !packHelp.scriptDefined("watch:js") ){
      schema.push({
        description:'App has Html5 based routing',
        name:'html5Mode',
        default:'yes',
        ask: ()=>isPerformScripts() && promisePrompt.historyValueLikeTrue('addBuildJs')
      })
    }
  }
  
  const buildCssDefined = packHelp.scriptDefined("build:css")
  if( !buildCssDefined ){
    schema.push({
      description:'Add build:css convenient script to npm package',
      name:'addBuildCss',
      default:'yes',
      ask: isPerformScripts
    })

    schema.push({
      description:'Main SASS file path',
      name:'sassInputPath',
      default:()=>path.join( getAppSrcPath(), 'styles.scss' ),
      ask: ()=>promisePrompt.historyValueLikeTrue('addScripts') && promisePrompt.historyValueLikeTrue('addBuildCss')
    })    

    schema.push({
      description:'Output SASS css file path',
      name:'sassOutputPath',
      default:(r)=>path.join( getAppSrcPath(), 'assets', 'styles', 'styles.css' ),
      ask: ()=>promisePrompt.historyValueLikeTrue('addScripts') && promisePrompt.historyValueLikeTrue('addBuildCss')
    })    
  }

  const indexScriptDefined = packHelp.scriptDefined("build:index") 
  if( !indexScriptDefined ){
    schema.push({
      description:'Add build:index convenient script to npm package',
      name:'addBuildIndex',
      default:'yes',
      ask: isPerformScripts
    })

    schema.push({
      description:'Enter index.pug input file path',
      name:'indexInputPath',
      default: ()=>path.join(getAppSrcPath(), indexInputPath),
      ask: ()=>isPerformScripts() && promisePrompt.isLikeTrue( promisePrompt.prompt.history('addBuildIndex').value )
    })

    schema.push({
      description:'Create index.pug templating file',
      name:'createIndex',
      default:'yes',
      ask: ()=>{
        const indexInputPath = promisePrompt.prompt.history('indexInputPath').value
        return isPerformScripts() && !fs.existsSync( path.join(process.cwd(),indexInputPath) )
      }
    })

    schema.push({
      description:'Build index.html via package script build:index',
      name:'runBuildIndex',
      default:'yes',
      ask: ()=>isPerformScripts() && promisePrompt.isLikeTrue( promisePrompt.prompt.history('addBuildIndex').value )
    })
  }

  schema.push({
    description:'Update npm run build package.json script',
    name:'manageBuildScript',
    default:'yes',
    ask: ()=>isPerformScripts()
  })

  schema.push({
    description:'Update npm run watch package.json script',
    name:'manageWatchScript',
    default:'yes',
    ask: ()=>isPerformScripts()
  })

  return schema
}

function paramAngularCompilers(){
  let promise = Promise.resolve()

  if( !promiseSpawn.isModuleInstalled('@angular/compiler') ){
    promise = promise
    .then( ()=>log('Installing @angular/compiler-cli to handle AoT compilation') )
    .then( ()=>promiseSpawn.installPacks(['@angular/compiler'],{log:log}) )
  }
  
  if( !promiseSpawn.isModuleInstalled('@angular/compiler-cli') ){
    promise = promise
    .then( ()=>log('Installing @angular/compiler-cli to handle AoT compilation') )
    .then( ()=>promiseSpawn.installPacks(['@angular/compiler-cli'],{log:log}) )
  }

  return promise
}

function processPrompts(results){
  let promise = Promise.resolve()
  
  if(!results)return promise;

  let savePack = false
  const installs = []
  let paramNgCompilers = false
  const myAppSrcPath = results.appSrcPath

  promise = promise.then( ()=>ackPath( results.appSrcPath ).paramDir() )
  promise = promise.then( ()=>processTsResults(results) )

  /* build:index scripting */
    const addBuildIndex = promisePrompt.isLikeTrue(results.addBuildIndex)
    if(addBuildIndex){
      savePack = true
      
      packHelp.setScript(
        "build:index",
        "pug "+results.indexInputPath+" --out "+results.buildPath,
        "Casts index.pug layout into index.html template to act as app entry file"
      )

      packHelp.setScript(
        "watch:index",
        "npm run build:index -- --watch",
        "Casts index.pug layout into index.html template to act as app entry file"
      )
      
      if( promisePrompt.isLikeTrue(results.createIndex)){
        promise = promise.then(()=>{
          log('Creating '+results.indexInputPath+'...')
          const html = fs.readFileSync( path.join(__dirname,'lib','ack-app','index.pug') ).toString()
          const Path = ackPath(results.indexInputPath)

          return Path.paramDir()
          .then( ()=>Path.writeFile(html) )
        })
      }

    }
  /* end build:index scripting */

  // compile:templates
  if( promisePrompt.isLikeTrue(results.addCompileTemplates) ){
    savePack = true

    packHelp.setScript(
      "compile:templates",
      "ack-pug-bundler " + path.join(myAppSrcPath,"components") + " " + path.join(myAppSrcPath,"components") + " --outFileExt template.ts --outType ts --oneToOne",
      "Casts pugs folder, that has layout files like template.pug, into TypeScript compatible template.pug.ts files"
    )

    if( !packHelp.scriptDefined('watch:templates') ){
      //ackPath(myAppSrcPath).join("components","pugs").paramDir()
      //ackPath(myAppSrcPath).join("components","templates").paramDir()
      packHelp.setScript(
        "watch:templates",
        "npm run compile:templates -- --watch",
        "Watches pugs folder for changes to engage the script compile:templates"
      )
    }

    if( !promiseSpawn.isModuleInstalled('ack-pug-bundler') ){    
      installs.push({name:'ack-pug-bundler', details:'Installing ack-pug-bundler to handle casting pugs to .ts files'})
    }
  }

  // compile:aot
  /*
  if( promisePrompt.isLikeTrue(results.addCompileAot) ){
    savePack = true
    packHelp.setScript(
      "compile:aot",
      "ngc -p " + path.join(myAppSrcPath,"tsconfig.aot.json"),
      "Compiles TypeScript source files, Ahead of Time to reduce load times, to output folder"
    )

    paramNgCompilers = true
  }*/

  // build:js
  if( promisePrompt.isLikeTrue(results.addBuildJs) ){
    savePack = true
    
    packHelp.setScript(
      "build:js",
      "npm-run-all build:js:prod build:js:dev",
      "Builds one TypeScript source file into a final www output file. Node memory has been increased to cover large app builds"
    )
    
    packHelp.setScript(
      "build:js:dev",
      "node --max-old-space-size=8192 ./node_modules/.bin/ng build dev",
      "Builds one angular based developement app"
    )
    
    packHelp.setScript(
      "build:js:prod",
      "node --max-old-space-size=8192 ./node_modules/.bin/ng build prod --aot --delete-output-path=false",
      "Builds one angular based production ready app"
    )
    
    if( !packHelp.scriptDefined("watch:js") ){
      const htmlMode = promisePrompt.isLikeTrue(results.html5Mode) ? ' --html5Mode' : ''
      packHelp.setScript(
        "watch:js",
        "node --max-old-space-size=8192 ./node_modules/.bin/ng serve dev --open",
        "Watches one angular based developement app"
      )

      packHelp.setScript(
        "watch:js:prod",
        "node --max-old-space-size=8192 ./node_modules/.bin/ng serve prod --open --source-map",
        "Watches one angular based production ready app"
      )
    }
    
    paramNgCompilers = true
  }

  // build:css
  if( promisePrompt.isLikeTrue(results.addBuildCss) ){
    savePack = true

    packHelp.setScript(
      "build:css",
      "ack-sass "+results.sassInputPath+" "+results.sassOutputPath+" --production",
      "Builds one SASS source file into a final css output file"
    )

    if( !packHelp.scriptDefined("watch:css") ){
      packHelp.setScript(
        "watch:css",
        "ack-sass "+results.sassInputPath+" "+results.sassOutputPath+" --watch",
        "Builds one SASS source file into a final css output file"
      )
    }

    if( !promiseSpawn.isModuleInstalled('ack-sass') ){    
      installs.push({
        name:'ack-sass',
        details:'Installing ack-sass to handle casting .scss files to .css file'
      })
    }

    //default styles.scss file
    const Path = ackPath( process.cwd() ).join( results.sassInputPath )
    promise = promise.then(()=>Path.File().exists())
    .then( defined=>{
      if(defined)return
      log('Created empty '+results.sassInputPath+' file')
      return Path.writeFile( ackPath( __dirname ).join('lib','ack-app','styles.scss').File().sync().readAsString() )
    })
  }

  const build = promisePrompt.isLikeTrue(results.manageBuildScript)
  if( build ){
    savePack = true
    const buildArray = (packHelp.getScript("build") || 'npm-run-all -s').split(' ')
    const builders = [
      "copy:fonts",
      "build:css",
      "build:index",
      //"compile:prefx",
      "compile:templates",
      //"compile:aot",
      "build:js"
    ]

    builders.forEach(name=>{
      if( !packHelp.scriptDefined(name) || buildArray.indexOf(name)>=0 )return
      buildArray.push(name)
    })
    
    packHelp.setScript(
      "build",
      buildArray.join(' '),
      "Builds TypeScript files to output folder"
    )

    paramNgCompilers = true
  }

  const watch = promisePrompt.isLikeTrue(results.manageWatchScript)
  if( watch ){
    savePack = true

    const watchArray = (packHelp.getScript("watch") || 'npm-run-all --parallel').split(' ')
    const watchers = [
      //"compile:aot",//ensure watched AoT files exist
      "copy:fonts",//if fonts were changed before watch, they will be rendered here
      "build:index",//if index.pug was changed before watch, it will be rendered here
      "compile:templates",//if templates was changed before watch, they will be rendered here
      "watch:css",
      "watch:index",
      "watch:templates",
      "watch:js"
    ]

    watchers.forEach(name=>{
      if( !packHelp.scriptDefined(name) || watchArray.indexOf(name)>=0 )return
      watchArray.push(name)
    })
    
    packHelp.setScript(
      "watch",
      watchArray.join(' '),
      "Employes other watch script to particpate in a combined"
    )
  }

  //AFTER package scripting
  if( savePack ){
    promise = promise.then( ()=>packHelp.save() )
  }

  if( (build || watch) && !promiseSpawn.isModuleInstalled('npm-run-all') ){
    promise = promise
    .then( ()=>log('To handle running multiple scripts across any device, npm-run-all will be installed') )
    .then( ()=>promiseSpawn.installPacks(['npm-run-all']) )
  }

  if( paramNgCompilers ){
    promise = promise.then( paramAngularCompilers )
  }

  //INSTALLS MUST COME AFTER package manipulations
  if( installs.length ){
    installs.forEach(install=>{
      promise = promise
      .then( ()=>log(install.details) )
      .then( ()=>promiseSpawn.installPacks([install.name],{log:log}) )
    })
  }

  //build index.ts    
  if(  promisePrompt.isLikeTrue(results.createIndexTs) ){
    promise = promise.then(()=>{
      const writeFile = path.join(getAppSrcPath(), 'index.ts')
      log('Creating '+writeFile+'...')
      const contents = fs.readFileSync( path.join(__dirname,'lib','ack-app','index.ts') ).toString()
      const Path = ackPath(writeFile)

      return Path.paramDir()
      .then( ()=>Path.writeFile(contents) )
    })
  }

  //build index.prod.ts
  if(  promisePrompt.isLikeTrue(results.createIndexProdTs) ){
    promise = promise.then(()=>{
      const writeFile = path.join(getAppSrcPath(), 'index.prod.ts')
      log('Creating '+writeFile+'...')
      const contents = fs.readFileSync( path.join(__dirname,'lib','ack-app','index.prod.ts') ).toString()
      const Path = ackPath(writeFile)

      return Path.paramDir()
      .then( ()=>Path.writeFile(contents) )
    })
  }

  //build app.module.ts
  if(  promisePrompt.isLikeTrue(results.createAppModuleTs) ){
    promise = promise.then(()=>{
      const writeFile = path.join(getAppSrcPath(), 'app.module.ts')
      log('Creating '+writeFile+'...')
      const contents = fs.readFileSync( path.join(__dirname,'lib','ack-app','app.module.ts') ).toString()
      const Path = ackPath(writeFile)

      return Path.paramDir()
      .then( ()=>Path.writeFile(contents) )
    })
  }

  /* after run scripts */
    if( promisePrompt.isLikeTrue(results.runBuildIndex) ){
      promise = promise
      .then(()=>log('Building index.html file...'))
      .then( ()=>promiseSpawn(['npm','run','build:index'], {log:log}) )
    }

    /*if( promisePrompt.isLikeTrue(results.runPrefx) ){
      promise = promise
      .then(()=>log('Creating ack-angular-fx prefx.ts file...'))
      .then( ()=>promiseSpawn(['npm','run','compile:prefx'], {log:log}) )
    }*/
  /* end : after run scripts */

  return promise
  .then( ()=>ackPackHelp.updatePrompt("init:ack-app", results).save() )
}

function processTsResults(results){
  let promise = Promise.resolve()
  const appRoot = getAppSrcPath()
  const tsOptions = {
    //writeTsAotConfig : promisePrompt.isLikeTrue(results.writeTsAotConfig),
    writeAngularJson    : promisePrompt.isLikeTrue(results.writeAngularJson),
    writeTsConfig    : promisePrompt.isLikeTrue(results.writeTsConfig),
    createTypings    : promisePrompt.isLikeTrue(results.createTypings)
  }

  if(tsOptions.writeTsConfig
  || tsOptions.createTypings
  || tsOptions.writeAngularJson
  //|| tsOptions.writeTsAotConfig
  ){
    promise = promise.then( ()=>ackPath(appRoot).param() )
  }

  if(tsOptions.writeTsConfig){
    promise = promise.then( ()=>writeTsConfig(appRoot, tsOptions) )
  }

  if(tsOptions.writeAngularJson){
    promise = promise.then( ()=>writeAngularJson(appRoot, tsOptions) )
  }

  /*if(tsOptions.writeTsAotConfig){
    promise = promise.then( ()=>writeTsAotConfig(appRoot, tsOptions) )
  }*/

  if(tsOptions.createTypings){
    promise = promise.then( ()=>createTypings(appRoot, tsOptions) )
  }

  return promise
}

function writeTsConfig(appRoot, options){
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

function writeAngularJson(appRoot, options){
  const folderPath = packHelp.getFolderPath()
  const filePath = path.join(folderPath,'angular.json')
  const exists = fs.existsSync( filePath )
  if(exists)return
  const config = angularConfig
  /*if(options && options.createTypings){
    config.files = config.files || []
    config.files.push('typings.d.ts')
  }*/
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2))
  log('created',filePath)
}

/*
function writeTsAotConfig(appRoot, options){
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
}*/

function createTypings(appRoot, options){
  const filePath = path.join(appRoot,'typings.d.ts')
  const exists = fs.existsSync( filePath )
  if(exists)return
  fs.writeFileSync(filePath, typingsConfig)
  log('created',filePath)
}

runPrompts()
.then(processPrompts)
.catch(e=>{
  if(e.message=='canceled'){
    return
  }
  log.error(e)
})
