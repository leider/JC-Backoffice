const { setHeadlessWhen, setCommonPlugins } = require("@codeceptjs/configure");
// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

// enable all common plugins https://github.com/codeceptjs/configure#setcommonplugins
setCommonPlugins();

const sqliteHelper = require("./helpers/sqlitehelpers");

/** @type {CodeceptJS.MainConfig} */
exports.config = {
  tests: "./tests/*_test.js",
  output: "./output",
  helpers: {
    Playwright: {
      browser: "chromium",
      url: "http://localhost:1970",
      locale: "de",
      show: true,
      keepCookies: true,
    },
    SqliteHelper: {
      require: "./helpers/sqlitehelpers",
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
            I.see("admin");
          },
          fetch: () => "yes",
          restore: () => {},
        },
      },
    },
  },
  include: {
    I: "./steps_file.js",
  },
  bootstrap() {
    new sqliteHelper().createData("userstore", "admin");
  },
  teardown() {
    new sqliteHelper().dropAllCollections();
  },
  name: "frontendtests",
};
