/// <reference types='codeceptjs' />
type filters = typeof import('./helpers/filters');
type SqliteHelper = import('./helpers/SqliteHelper');
type ChaiWrapper = import('codeceptjs-chai');

declare namespace CodeceptJS {
  interface SupportObject { I: I, current: any, login: any, filters: filters }
  interface Methods extends Playwright, SqliteHelper, ChaiWrapper {}
  interface I extends WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}
