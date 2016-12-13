const webpack = require('webpack')
const path = require('path')

const config = {
  //entry: './src/ack-angular.js',
  //output: path.join(__dirname,'www','ack-angular.js'),
  module:{
    preLoaders: [
      { test: /\.json$/, loader: "json-loader" },
    ],
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules\/localforage/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  plugins: []
}

if(process.argv.indexOf('--skip-source-maps')<0 && process.argv.indexOf('--production')<0){
  config.devtool = "#source-map"
  /*
  config.plugins.push(
    new webpack.SourceMapDevToolPlugin({
        //filename: 'xxx.map',
        exclude: ['*.js']
    })
  )*/
}


if(process.argv.indexOf('--minify')>=0 || process.argv.indexOf('--production')>0){
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {warnings:false}
    })
  )
}

module.exports = config