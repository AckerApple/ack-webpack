const path = require('path')
const inPath = relatize(process.argv[2])
const outPath = relatize(process.argv[3])

function relatize(p){
  if(p.substring(0, path.sep.length)!=path.sep){
    p = path.join(process.cwd(), p)
  }
  return p
}

require('./webpacker')(inPath, outPath)
