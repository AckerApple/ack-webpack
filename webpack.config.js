const webpack = require('webpack')
const path = require('path')

const supportTs = resolver('ts-loader')
const supportBabel = resolver('babel-loader')
//const supportJson = resolver('json-loader')
const supportPug = resolver('pug-loader')

const production = process.argv.indexOf('--production')>=0
const sourceMap = process.argv.indexOf('--skip-source-maps')<0 && !production
const minify = process.argv.indexOf('--minify')>=0 || production

const extensions = ['.webpack.js', '.web.js']
const loaders = []

/*function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  var rooter = path.join.apply(path, [process.cwd()+'/app/'].concat(args));
  console.log('rooter',rooter)
  return rooter
}*/

const config = {
  bail:true,
  //context: root(),
  resolve: {
    extensions: extensions
  },
  module:{
    loaders: loaders
  },
  plugins: []
}

function resolver(name){
  try{
    return require.resolve(name)
  }catch(e){
    return false
  }
}

if(supportPug){
  extensions.push('.pug')
  extensions.push('.jade')
  loaders.push({ test: /\.(jade|pug)$/, loader: "pug-loader" })
  //loaders.push({ test: /\.pug$/, loader: 'pug-static' })
}

if(supportTs){
  extensions.push('.ts')
  //extensions.push('.d.ts')
  extensions.push('.js')
  const tsLoader = { test: /\.ts$/,loader: 'ts-loader', options:{} }
  //const tsLoader = {test: /\.ts$/,loader: 'awesome-typescript-loader'}

  //tsconfig file location  
  const projectIndex = process.argv.indexOf('--project')
  const configFileName = null
  if( projectIndex>0 ){
    tsLoader.options.configFileName = process.argv[projectIndex+1]
  }

  loaders.push(tsLoader)
}
/*
if(supportJson){
  extensions.push('.json')
  loaders.push({test: /\.json$/, loader: "json-loader"})
}
*/
if(supportBabel){
  extensions.push('.js')
  loaders.push({
    test: /\.js$/,
    exclude: /node_modules\/localforage/,//cant be bundled last time checked. This might not belong here
    loader: 'babel-loader',
    query: {
      presets: ['es2015']//this maybe only needed for babel?
    }
  })
}

if(sourceMap){
  config.devtool = "#source-map"
  //config.devtool = "source-map"
/*
  config.plugins.push(
    new webpack.SourceMapDevToolPlugin({
        //filename: 'xxx.map',
        exclude: ['*.js']
    })
  )
*/
}


if(minify){
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {warnings:false}
    })
  )
}

if(production) {
  config.plugins.push(new webpack.optimize.DedupePlugin());
  config.plugins.push(new webpack.NoErrorsPlugin());
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    // beautify: true, //debug
    // mangle: false, //debug
    // dead_code: false, //debug
    // unused: false, //debug
    // deadCode: false, //debug
    // compress: {
    //   screw_ie8: true,
    //   keep_fnames: true,
    //   drop_debugger: false,
    //   dead_code: false,
    //   unused: false
    // }, // debug
    // comments: true, //debug
    beautify: false, //prod
    mangle: false, //prod
    //mangle: { screw_ie8 : true }, //prod
    compress: { screw_ie8: true }, //prod
    comments: false //prod
  }));
}

module.exports = config