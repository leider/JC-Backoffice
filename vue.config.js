// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
require("./configure");
const configureAPI = require("./configureApp").default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  publicPath: "/vue/",
  outputDir: "static/vue",
  configureWebpack: {
    context: __dirname + "/vue", // to automatically find tsconfig.json
    entry: "./main.ts",
    resolve: {
      alias: {
        "@": path.resolve("vue")
      }
    },
    plugins: [
      new CopyPlugin([
        {
          from: path.join(__dirname, "vue/public"),
          to: path.join(__dirname, "static"),
          toType: "dir",
          ignore: ["index.html", ".DS_Store"]
        }
      ])
    ]
  },
  devServer: {
    before: configureAPI
  },
  /* to configure vue/public as the location of the template */
  chainWebpack: config => {
    config.plugin("html").tap(args => {
      args[0].template = path.join(__dirname, "vue/public/index.html");
      return args;
    });
  }
};
