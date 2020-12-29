/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const plugins = [
  new CopyPlugin([
    {
      from: path.join(__dirname, "public"),
      to: path.join(__dirname, "../backend/static"),
      toType: "dir",
      ignore: ["index.html", ".DS_Store"],
    },
  ]),
];

const config = {
  publicPath: "/vue/",
  outputDir: "../backend/static/vue",
  configureWebpack: {
    plugins: plugins,
  },
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].template = path.join(__dirname, "public/index.html");
      return args;
    });
  },
};

//plugins.push(new (require("webpack-bundle-analyzer").BundleAnalyzerPlugin)());
if (process.env.NODE_ENV !== "production") {
  require("../backend/configure");
  const configureAPI = require("../backend/configureApp").default;
  config.devServer = { before: configureAPI };
}
module.exports = config;
