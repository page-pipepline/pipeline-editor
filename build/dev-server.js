require('./check-versions')();
const config = require('../config');

const path = require('path');
const opn = require('opn');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.dev.conf');

const HOST = process.env.HOST || config.dev.host
const PORT = process.env.PORT && Number(process.env.PORT) || config.dev.port

const uri = `http://${HOST}:${PORT}${config.dev.assetsPublicPath}#/`;
// default port where dev server listens for incoming traffic
// automatically open browser, if not set will be false
const autoOpenBrowser = !!config.dev.autoOpenBrowser;

const compiler = webpack(webpackConfig);

let _resolve;
const readyPromise = new Promise((resolve) => {
  _resolve = resolve;
});

const server = new webpackDevServer(compiler, {
  clientLogLevel: 'warning',
  historyApiFallback: {
    rewrites: [
      { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
    ],
  },
  hot: true,
  contentBase: false, // since we use CopyWebpackPlugin.
  compress: true,
  host: HOST,
  port: PORT,
  open: config.dev.autoOpenBrowser,
  overlay: config.dev.errorOverlay
    ? { warnings: false, errors: true }
    : false,
  publicPath: config.dev.assetsPublicPath,
  proxy: config.dev.proxyTable,
  watchOptions: {
    poll: config.dev.poll,
  },
  stats: {
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  },
});

console.log('> Starting dev server...');
server.listen(PORT, '0.0.0.0', () => {
  console.log(`> Listening at ${uri}\n`);
  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    console.log(uri);
    opn(uri);
  }
  _resolve();
});

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close();
  }
};

