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
  //retry: 4,
  // 10s is too low for full user-create/login/relogin end-to-end flows and causes
  // noisy non-terminated timeout errors even on successful runs.
  timeout: 30,
  helpers: {
    Playwright: {
      browser: "chromium",
      url: "http://localhost:1970",
      locale: "de",
      show: showBrowser && !CI,
      keepCookies: true,
      // "load" races with React Router client redirects; domcontentloaded avoids interrupted goto noise.
      waitForNavigation: "domcontentloaded",
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
      saveToFile: false,
      inject: "login",
      users: {
        admin: {
          login: async (I) => {
            I.amOnPage("/vue/login");

            // Depending on existing cookie/bootstrap timing, login can either show form
            // or immediately land in the app shell. Accept both.
            for (let attempt = 0; attempt < 20; attempt++) {
              const teamVisible = await I.grabNumberOfVisibleElements(locate("*").withText("Team"));
              if (teamVisible > 0) {
                return;
              }

              const userVisible = await I.grabNumberOfVisibleElements("#login_username");
              if (userVisible > 0) {
                I.fillField("#login_username", "admin");
                I.fillField("#login_password", "admin");
                I.click("Anmelden");
                I.waitForText("Team", 5);
                return;
              }

              I.wait(0.25);
            }

            throw new Error("Login state did not stabilize (neither Team nor login form visible)");
          },
          check: (I) => {
            // Contract: logged in means the app shell with "Team" is visible.
            I.waitForText("Team", 5);
          },
          fetch: () => undefined,
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
    adminPage: "./pages/AdminPage",
    loginPage: "./pages/LoginPage",
  },
  bootstrap: async () => {
    new SqliteHelper(config).createData("userstore", "admin");
  },
  teardown: async () => {
    new SqliteHelper(config).dropAllCollections();
  },
  name: "frontendtests",
};
