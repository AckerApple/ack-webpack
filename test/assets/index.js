import {message} from "./index.json"

console.log('started',new Date())

setTimeout(function(){
  document.body.innerHTML += '<div>-- view console : '+Date.now()+' --</div>'
}, 700)


console.log(message)

console.log('done',new Date())