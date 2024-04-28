/// <reference types='codeceptjs' />
type steps_file = typeof import('./steps_file');
type SqliteHelper = import('./helpers/SqliteHelper.js');
type ChaiWrapper = import('codeceptjs-chai');

declare namespace CodeceptJS {
  interface SupportObject { I: I, current: any, login: any }
  interface Methods extends Playwright, SqliteHelper, ChaiWrapper {}
  interface I extends ReturnType<steps_file>, WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}
