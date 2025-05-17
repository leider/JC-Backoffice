import SqliteHelper from "./helpers/SqliteHelper";

const reporters = {
  "codeceptjs-cli-reporter": {
    stdout: "-",
    options: {
      verbose: false,
      steps: true,
      noreverse: true,
      debug: false,
    },
  },
};

if (process.env.IJ_CODECEPTJS_MOCHA_MULTI) {
  reporters["codeceptjs-intellij-reporter"] = { stdout: "-" };
}

const showBrowser = true;
const CI = !!process.env.CI;

export const config: CodeceptJS.MainConfig = {
  tests: "./tests/*_test.ts",
  output: "./output",
  retry: 4,
  timeout: 10,
  helpers: {
    Playwright: {
      browser: "chromium",
      url: "http://localhost:1970",
      locale: "de",
      show: showBrowser && !CI,
      keepCookies: true,
    },
    SqliteHelper: {
      require: "./helpers/SqliteHelper",
    },
    ChaiWrapper: {
      require: "codeceptjs-chai",
    },
  },
  mocha: { reporterOptions: reporters },
  plugins: {
    auth: {
      enabled: true,
      saveToFile: true,
      inject: "login",
      users: {
        admin: {
          login: (I) => {
            I.amOnPage("/");
            I.waitForText("Benutzername");
            I.fillField("Benutzername", "admin");
            I.fillField("Passwort", "admin");
            I.click("Anmelden");
            I.wait(0.5);
          },
          check: (I) => {
            I.amOnPage("/");
            I.waitForText("Team");
          },
          fetch: () => "yes",
          restore: () => {},
        },
      },
    },
  },
  include: {
    filters: "./helpers/filters",
    ortePage: "./pages/OrtePage",
    konzertPage: "./pages/KonzertPage",
    konzertGaestePage: "./pages/KonzertGaestePage",
  },
  bootstrap: async () => {
    new SqliteHelper(config).createData("userstore", "admin");
  },
  teardown: async () => {
    new SqliteHelper(config).dropAllCollections();
  },
  name: "frontendtests",
};
