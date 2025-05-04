import SqliteHelper from "./helpers/SqliteHelper";

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
      show: false,
      keepCookies: true,
    },
    SqliteHelper: {
      require: "./helpers/SqliteHelper",
    },
    ChaiWrapper: {
      require: "codeceptjs-chai",
    },
  },
  plugins: {
    auth: {
      enabled: true,
      saveToFile: true,
      inject: "login",
      users: {
        admin: {
          login: (I) => {
            I.amOnPage("/");
            I.fillField("Benutzername", "admin");
            I.fillField("Passwort", "admin");
            I.click("Anmelden");
            I.wait(0.5);
          },
          check: (I) => {
            I.amOnPage("/");
            I.wait(0.5);
            I.see("Team");
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
  },
  bootstrap: async () => {
    new SqliteHelper(config).createData("userstore", "admin");
  },
  teardown: async () => {
    new SqliteHelper(config).dropAllCollections();
  },
  name: "frontendtests",
};
