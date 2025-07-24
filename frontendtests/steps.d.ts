/// <reference types='codeceptjs' />
type filters = typeof import("./helpers/filters");
type ortePage = typeof import("./pages/OrtePage");
type konzertPage = typeof import("./pages/KonzertPage");
type konzertGaestePage = typeof import("./pages/KonzertGaestePage");
type adminPage = typeof import("./pages/AdminPage");
type loginPage = typeof import("./pages/LoginPage");
type SqliteHelper = import("./helpers/SqliteHelper");
type ChaiWrapper = import("codeceptjs-chai");

declare namespace CodeceptJS {
  interface SupportObject {
    I: I;
    current: any;
    login: any;
    filters: filters;
    ortePage: ortePage;
    konzertPage: konzertPage;
    konzertGaestePage: konzertGaestePage;
    adminPage: adminPage;
    loginPage: loginPage;
  }
  interface Methods extends Playwright, SqliteHelper, ChaiWrapper {}
  interface I extends WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}
