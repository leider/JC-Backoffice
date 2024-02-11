import Database from "better-sqlite3";
import conf from "../../../shared/commons/simpleConfigure.js";
import { loggers } from "winston";
import { execWithTry } from "../persistence/sqlitePersistence.js";

const sqlitedb = conf.get("sqlitedb") as string;
const db = new Database(sqlitedb);
const scriptLogger = loggers.get("scripts");
scriptLogger.info(`DB = ${sqlitedb}`);

const STORE = "refreshtokens";
class LocalPersistence {
  constructor() {
    const columns = ["id TEXT PRIMARY KEY", "expiresAt TEXT", "userId TEXT"];
    db.exec(`CREATE TABLE IF NOT EXISTS ${STORE} ( ${columns.join(",")});`);
    execWithTry(`CREATE INDEX idx_${STORE}_id ON ${STORE}(id);`);
  }

  save(object: RefreshToken) {
    const { id, expiresAt, userId } = object;
    db.exec(`REPLACE INTO ${STORE} (id,expiresAt,userId) VALUES ('${id}', '${expiresAt.toJSON()}', '${userId}')`);
  }

  getById(id: string) {
    const query = `SELECT * FROM ${STORE} WHERE id = '${id}';`;
    return db.prepare(query).get() as RefreshToken | undefined;
  }

  removeOldTokens() {
    return db.exec(`DELETE FROM ${STORE} WHERE expiresAt < '${new Date().toJSON()}';`);
  }
}

const persistence = new LocalPersistence();

export interface RefreshToken {
  id: string;
  userId: string;
  expiresAt: Date;
}

export default {
  save: function save(refreshToken: RefreshToken) {
    persistence.save(refreshToken);
    return refreshToken;
  },

  forId: function forId(id: string) {
    return persistence.getById(id);
  },

  removeExpired: async function removeExpired() {
    return persistence.removeOldTokens();
  },
};
