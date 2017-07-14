const prompt = require('prompt')

/** You must run .stop when done with prompts */
module.exports = function promisePrompt(scheme, options){
  options = options || {}
  options.message = options.message || '[ack-webpack]'
  return new Promise(function(res,rej){
    prompt.message = options.message
    prompt.start()
    prompt.get(scheme, function(err, result){
      err ? rej(err) : res(result)
    })
  })
}

module.exports.stop = function(){
  if(prompt.stop)prompt.stop()
}

module.exports.prompt = prompt

function isLikeTrue(v){
  if(v==null)return false
  if(v.toLowerCase())v=v.toLowerCase()
  return v=='yes' || v=='true' || v=='1'
}
module.exports.isLikeTrue = isLikeTrue


const historyMemory = {}//we need to create another memory of question history as too many questions causes loss in history
function historyValue(name){
  if( historyMemory[name]!=null ){
    return historyMemory[name]
  }
  
  let hist = prompt.history(name)
  if(hist != null)return historyMemory[name] = hist.value

  let value = prompt.getInput(name)
  if(value != null)return historyMemory[name] = value
}
module.exports.historyValue = historyValue

module.exports.historyValueLikeTrue = function(name){
  return isLikeTrue( historyValue(name) )
}