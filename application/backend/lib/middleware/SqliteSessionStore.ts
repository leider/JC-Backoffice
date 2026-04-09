import { Store, SessionData } from "express-session";
import type Database from "better-sqlite3";

export default class SqliteSessionStore extends Store {
  private stmtGet;
  private stmtSet;
  private stmtDestroy;
  private stmtTouch;
  private stmtCleanup;
  private cleanupTimer: ReturnType<typeof setInterval>;

  constructor(
    db: Database.Database,
    private ttl: number,
  ) {
    super();

    const hasExpiredCol = db.prepare(`SELECT COUNT(*) as cnt FROM pragma_table_info('sessions') WHERE name = 'expired'`).get() as
      | { cnt: number }
      | undefined;
    if (!hasExpiredCol || hasExpiredCol.cnt === 0) {
      db.exec(`DROP TABLE IF EXISTS sessions`);
    }
    db.exec(`CREATE TABLE IF NOT EXISTS sessions (sid TEXT PRIMARY KEY, sess TEXT NOT NULL, expired INTEGER NOT NULL)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_sessions_expired ON sessions(expired)`);

    this.stmtGet = db.prepare<[string, number], { sess: string }>(`SELECT sess FROM sessions WHERE sid = ? AND expired > ?`);
    this.stmtSet = db.prepare<[string, string, number]>(`REPLACE INTO sessions (sid, sess, expired) VALUES (?, ?, ?)`);
    this.stmtDestroy = db.prepare<[string]>(`DELETE FROM sessions WHERE sid = ?`);
    this.stmtTouch = db.prepare<[number, string]>(`UPDATE sessions SET expired = ? WHERE sid = ?`);
    this.stmtCleanup = db.prepare<[number]>(`DELETE FROM sessions WHERE expired < ?`);

    this.cleanupTimer = setInterval(() => this.stmtCleanup.run(Date.now()), 15 * 60 * 1000);
    this.cleanupTimer.unref();
  }

  private expiration(session: SessionData): number {
    return Date.now() + (session.cookie?.maxAge ?? this.ttl);
  }

  get(sid: string, callback: (err?: Error | null, session?: SessionData | null) => void) {
    try {
      const row = this.stmtGet.get(sid, Date.now());
      callback(null, row ? JSON.parse(row.sess) : null);
    } catch (e) {
      callback(e as Error);
    }
  }

  set(sid: string, session: SessionData, callback?: (err?: Error) => void) {
    try {
      this.stmtSet.run(sid, JSON.stringify(session), this.expiration(session));
      callback?.();
    } catch (e) {
      callback?.(e as Error);
    }
  }

  destroy(sid: string, callback?: (err?: Error) => void) {
    try {
      this.stmtDestroy.run(sid);
      callback?.();
    } catch (e) {
      callback?.(e as Error);
    }
  }

  touch(sid: string, session: SessionData, callback?: (err?: Error) => void) {
    try {
      this.stmtTouch.run(this.expiration(session), sid);
      callback?.();
    } catch (e) {
      callback?.(e as Error);
    }
  }
}
