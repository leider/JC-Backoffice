const { setHeadlessWhen, setCommonPlugins } = require("@codeceptjs/configure");
// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

// enable all common plugins https://github.com/codeceptjs/configure#setcommonplugins
setCommonPlugins();

const mongoHelper = require("./helpers/mongohelpers");

let server;
/** @type {CodeceptJS.MainConfig} */
exports.config = {
  tests: "./*_test.js",
  output: "./output",
  helpers: {
    Playwright: {
      browser: "chromium",
      url: "http://localhost:1970",
      locale: "de",
      show: false,
      keepCookies: true,
    },
    MongoHelper: {
      require: "./helpers/mongohelpers",
    },
  },
  plugins: {
    autoLogin: {
      enabled: true,
      saveToFile: true,
      users: {
        admin: {
          login: (I) => {
            I.amOnPage("/");
            I.fillField("Benutzername", "admin");
            I.fillField("Passwort", "admin");
            I.click("Anmelden");
            I.wait(1);
          },
          check: (I) => {
            I.amOnPage("/");
            I.dontSee("Benutzername");
          },
          fetch: () => {
            return "yes";
          },
          restore: () => {},
        },
      },
    },
  },
  include: {
    I: "./steps_file.js",
  },
  async bootstrap() {
    process.env.CONF = "config-it";
    server = await import("../backend/start.js");
    server.start("config-it");
    await new mongoHelper().createData("userstore", "admin");
  },
  async teardown() {
    await new mongoHelper().dropAllCollections();
    server.stop();
    process.exit(0);
  },
  name: "frontendtests",
};
