const webpack = require('webpack')
const path = require('path')

const supportTs = resolver('ts-loader')
const supportBabel = resolver('babel-loader')
const supportJson = resolver('json-loader')
const supportPug = resolver('pug-loader')

const sourceMap = process.argv.indexOf('--skip-source-maps')<0 && process.argv.indexOf('--production')<0
const minify = process.argv.indexOf('--minify')>=0 || process.argv.indexOf('--production')>0

function resolver(name){
  try{
    return require.resolve(name)
  }catch(e){
    return false
  }
}

const jsLoader = {
  test: /\.js$/,
  exclude: /node_modules\/localforage/,//cant be bundled last time checked. This might not belong here
  loader: null,
  query: {
    presets: ['es2015']//this maybe only needed for babel?
  }
}
const extensions = ['.webpack.js', '.web.js', '.js']
const loaders = []

if(supportTs){
  extensions.push('.ts')
  loaders.push({ test: /\.ts$/, loader: 'ts-loader' })
  //jsLoader.loader = 'ts-loader'
}

if(supportJson){
  extensions.push('.json')
  loaders.push({ test: /\.json$/, loader: "json-loader" })
}

if(supportPug){
  extensions.push('.pug')
  extensions.push('.jade')
  loaders.push({ test: /\.(jade|pug)$/, loader: "pug" })
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
  /*
  config.plugins.push(
    new webpack.SourceMapDevToolPlugin({
        //filename: 'xxx.map',
        exclude: ['*.js']
    })
  )*/
}


if(minify){
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {warnings:false}
    })
  )
}

module.exports = config