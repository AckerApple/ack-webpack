#!/usr/bin/env node
const path = require('path')
const firstArg = process.argv[2]

switch(firstArg){
  case 'init':require('./init');break
  case 'init:angular':require('./init-angular');break

  case 'reload':require('./reload');break

  case 'install':require('./install').exec(process.argv);break
  case 'install:js':
    require('./install').exec([...process.argv,'--out','js_modules']);
  break

  default:runWebpacker()
}

function runWebpacker(){
  const inPath = relatize(firstArg)
  const outPath = relatize(process.argv[3])
  require('../webpacker')(inPath, outPath)
}

function relatize(p){
  if(p.substring(0, path.sep.length)!=path.sep){
    p = path.join(process.cwd(), p)
  }
  return p
}
