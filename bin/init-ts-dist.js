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
  }]

  return promisePrompt(schema)
}

function processPrompts(results){
  let promise = Promise.resolve()
  
  if(!results)return promise;

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
