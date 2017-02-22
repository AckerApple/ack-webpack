const webpack = require('webpack')
const path = require('path')

const supportTs = resolver('ts-loader')
const supportBabel = resolver('babel-loader')
const supportJson = resolver('json-loader')
const supportPug = resolver('pug-loader')

const production = process.argv.indexOf('--production')>=0
const sourceMap = process.argv.indexOf('--skip-source-maps')<0 && !production
const minify = process.argv.indexOf('--minify')>=0 || production

function resolver(name){
  try{
    return require.resolve(name)
  }catch(e){
    return false
  }
}

/*function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [__dirname].concat(args));
}*/

const jsLoader = {
  //context: root(),
  test: /\.js$/,
  exclude: /node_modules\/localforage/,//cant be bundled last time checked. This might not belong here
  loader: null,
  query: {
    presets: ['es2015']//this maybe only needed for babel?
  }
}
const extensions = ['.webpack.js', '.web.js']
const loaders = []

if(supportPug){
  extensions.push('.pug')
  extensions.push('.jade')
  loaders.push({ test: /\.(jade|pug)$/, loader: "pug-loader" })
}

if(supportTs){
  extensions.push('.ts')
  extensions.push('.js')
  loaders.push({ test: /\.ts$/, loader: 'ts-loader' })
  //jsLoader.loader = 'ts-loader'
}

if(supportJson){
  extensions.push('.json')
  loaders.push({ test: /\.json$/, loader: "json-loader" })
}

if(supportBabel){
  jsLoader.loader = 'babel-loader'
  loaders.push(jsLoader)
}

const config = {
  bail:true,
  resolve: {
    extensions: extensions
  },
  module:{
    loaders: loaders
  },
  plugins: []
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