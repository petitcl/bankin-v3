const GasPlugin = require("gas-webpack-plugin");

const entry = "./build/main.js";

module.exports = {
  // we always use dev mode because bundle size is unimportant - code runs server-side
  mode: "development",
  context: __dirname,
  entry,
  output: {
    path: __dirname,
    filename: "Code.js",
    iife: false,
    libraryTarget: 'var',  // expose as globals
    library: 'BankinApp'   // available globally in GAS

    // libraryTarget: 'this',
  },
  plugins: [
    new GasPlugin({
      autoGlobalExportsFiles: [entry],
    }),
  ],
  devtool: false,
};