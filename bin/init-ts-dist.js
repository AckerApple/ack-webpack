const ackPath = require('ack-path')
const promiseSpawn = require('../promiseSpawn.function')
const install = require('../install.function')
const path = require('path')
const fs = require('fs')
const log = require("../log.function")
const promisePrompt = require('../promisePrompt.function')
const PackHelp = require('./package.help.js')
const packHelp = new PackHelp()

const distSrcPath = path.join('src')
let indexInputPath = path.join('index.pug')

function runPrompts(){
  const schema = [{
    description:'Distribution src folder path',
    name:'distSrcPath',
    default:distSrcPath
  },{
    description:'Build output folder path',
    name:'buildPath',
    default: ()=>path.join(promisePrompt.historyValue('distSrcPath'), '../', 'dist')
  },{
    description:'Create tsconfig file',
    name:'createTsConfigFile',
    default:'yes',
    ask:()=>!ackPath( promisePrompt.historyValue('distSrcPath') ).sync().exists()
  },{
    description:'Create tsconfig file',
    name:'createTsConfigFile',
    default:'yes',
    ask:()=>!ackPath( promisePrompt.historyValue('distSrcPath') ).sync().exists()
  }]

  const buildScriptDefined = packHelp.scriptDefined("build")
  if( !buildScriptDefined ){
    schema.push({
      description:'Add build convenient script to npm package',
      name:'addBuildScript',
      default:'yes'
    })
  }

  return promisePrompt(schema)
}

function processPrompts(results){
  let promise = Promise.resolve()
  
  if(!results)return promise;

  let savePack = false

  //param directories
  promise = promise.then( ()=>ackPath( results.distSrcPath ).paramDir() )
  promise = promise.then( ()=>ackPath( results.buildPath ).paramDir() )

  //create distributable tsconfig.json file
  const createTsConfigFile = promisePrompt.isLikeTrue(results.createTsConfigFile)
  if(createTsConfigFile){
    const tsconfigOutpath = path.join( results.distSrcPath, 'tsconfig.json' )
    promise = promise.then(()=>{
      log('Creating '+tsconfigOutpath+'...')
      const fromData = fs.readFileSync( path.join(__dirname,'lib','ack-angular','tsconfig.dist.json') )
      const Path = ackPath( tsconfigOutpath )

      return Path.paramDir()
      .then( ()=>Path.writeFile(fromData) )
    })
  }

  const addBuildScript = promisePrompt.isLikeTrue(results.addBuildScript)
  if(addBuildScript){
    savePack = true
    packHelp.setScript(
      "build",
      "ngc --declaration --project " + results.distSrcPath,
      "Builds source code into a distributable package"
    )

    if( !promiseSpawn.isModuleInstalled('@angular/compiler') ){
      installs.push({name:'@angular/compiler', details:'Installing @angular/compiler to handle compiling typescript files in NodeJs'})
    }
    if( !promiseSpawn.isModuleInstalled('@angular/compiler-cli') ){
      installs.push({name:'@angular/compiler-cli', details:'Installing @angular/compiler-cli to handle invoking @angular/compiler from a command line interface'})
    }
  }

  if(savePack){
    promise = promise.then(()=>log('Saving package.json...'))
    .then(()=>packHelp.save())
  }

  return promise
}

runPrompts()
.then(processPrompts)
.catch(e=>{
  if(e.message=='canceled'){
    return
  }
  log.error(e)
})
