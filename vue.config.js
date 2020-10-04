// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CopyPlugin = require("copy-webpack-plugin");
//const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const plugins = [
  new CopyPlugin([
    {
      from: path.join(__dirname, "vue/public"),
      to: path.join(__dirname, "static"),
      toType: "dir",
      ignore: ["index.html", ".DS_Store"],
    },
  ]),
];

if (process.env.NODE_ENV !== "production") {
  // plugins.push(new BundleAnalyzerPlugin());
}

const config = {
  publicPath: "/vue/",
  outputDir: "static/vue",
  configureWebpack: {
    context: __dirname + "/vue", // to automatically find tsconfig.json
    entry: "./main.ts",
    resolve: {
      alias: {
        "@": path.resolve("vue"),
      },
    },
    plugins: plugins,
  },
  /* to configure vue/public as the location of the template */
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].template = path.join(__dirname, "vue/public/index.html");
      return args;
    });
  },
};

if (process.env.NODE_ENV !== "production") {
  require("./configure");
  const configureAPI = require("./configureApp").default;
  config.devServer = { before: configureAPI };
}
module.exports = config;
