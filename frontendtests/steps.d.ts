/// <reference types='codeceptjs' />
type steps_file = typeof import('./steps_file.js');
type SqliteHelper = import('./helpers/sqlitehelpers');

declare namespace CodeceptJS {
  interface SupportObject { I: I, current: any }
  interface Methods extends Playwright, SqliteHelper {}
  interface I extends ReturnType<steps_file>, WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}
