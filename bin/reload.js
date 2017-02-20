const reload = require('reload')
const log = require('../log.function')
const options = {
  log:log
}

var portArgIndex = process.argv.indexOf('-p')
if(portArgIndex<0)portArgIndex = process.argv.indexOf('--port')
options.port = portArgIndex>=0 ? process.argv[portArgIndex+1] : 3000


reload(process.argv[3],options)