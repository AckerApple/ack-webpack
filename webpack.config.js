const webpack = require('webpack')
const path = require('path')

const supportTs = resolver('ts-loader')
const supportBabel = resolver('babel-loader')
//const supportJson = resolver('json-loader')
const supportPug = resolver('pug-loader')

//const aot = process.argv.indexOf('--aot')>=0
const production = process.argv.indexOf('--production')>=0
const sourceMap = process.argv.indexOf('--skip-source-maps')<0 && !production
const minify = process.argv.indexOf('--minify')>=0 || production

const extensions = ['.webpack.js', '.web.js']
const loaders = []
let tsConfigFilePath = ''

/*function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  var rooter = path.join.apply(path, [process.cwd()+'/app/'].concat(args));
  console.log('rooter',rooter)
  return rooter
}*/
const cwd = process.cwd()
const modules = [ path.join(cwd, "node_modules") ]
const moduleArgIndex = process.argv.indexOf('--modules')
if(moduleArgIndex>=0){
  const modulesArg = process.argv[ moduleArgIndex+1 ].split(',')
  const absModules = modulesArg.map( relativePath=>path.join(cwd, relativePath) )
  Array.prototype.unshift.apply(modules, absModules)
}

const config = {
  bail:true,
  //watch:true,//ack-webpack uses reload to facilitate this
  //context: root(),
  resolve: {
    modules: modules,
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
  //loaders.push({ test: /\.(jade|pug)$/, loaders: ['raw-loader','pug-html-loader'] })
}

if(supportTs){
  //tsconfig file location  
  const projectIndex = process.argv.indexOf('--project')
  const configFileName = null
  let tsConfigFileName = ''
  
  if( projectIndex>0 ){
    tsConfigFilePath = process.argv[projectIndex+1]
  }

  /*
  if(aot){
    const ngToolsWebpack = require('@ngtools/webpack');
    const rootPath = process.cwd()
    config.plugins.push(
      new ngToolsWebpack.AotPlugin({
        tsConfigPath: path.join(rootPath, 'example','tsconfig.aot.json'),//tsConfigFilePath
        //basePath: path.join(rootPath, 'example'),
        entryModule: path.join(rootPath, 'example','aot', 'app.module#AppModule')
        //,mainPath: path.join(rootPath, 'example','aot', 'app.module')
      })
    )
  }*/

  extensions.push('.ts')
  extensions.push('.js')

  let tsLoader = { test: /\.ts$/,loader: 'ts-loader', options:{} }
  //let tsLoader = {test: /\.ts$/,loader: 'awesome-typescript-loader'}

  /*if(aot){
    tsLoader = {
      test: /\.(ts|tsx)$/,
      exclude: [/\.(spec|e2e)\.(ts|tsx)$/],
      loader: '@ngtools/webpack'
    }
  }else if(tsConfigFilePath){
    tsLoader.options.configFileName = tsConfigFilePath
  }*/

  if(tsConfigFilePath){
    tsLoader.options.configFileName = tsConfigFilePath
  }

  loaders.push(tsLoader)
}

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


/*config.plugins.push(
  new webpack.DefinePlugin({
    'process.env': {
      'ENV': 'production'
    }
  })
)*/

if(production || minify) {
  config.plugins.push(new webpack.optimize.DedupePlugin());
  //config.plugins.push(new webpack.NoErrorsPlugin());
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
    mangle: { screw_ie8 : true }, //prod
    compress: { screw_ie8: true }, //prod
    comments: false //prod
  }));
}

module.exports = config