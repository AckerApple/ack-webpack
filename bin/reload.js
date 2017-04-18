const reload = require('ack-reload')
const log = require('../log.function')
const options = {
  log:log, html5Mode:process.argv.indexOf('--html5Mode')>=0
}

var portArgIndex = process.argv.indexOf('-p')
if(portArgIndex<0)portArgIndex = process.argv.indexOf('--port')
options.port = portArgIndex>=0 ? process.argv[portArgIndex+1] : 8080

reload(process.argv[3],options)