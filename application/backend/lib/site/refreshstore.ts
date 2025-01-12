import { db, execWithTry } from "../persistence/sqlitePersistence.js";
import map from "lodash/map.js";

const STORE = "refreshtokens";

function smoothMigrate() {
  try {
    const result = map(db.prepare("SELECT * FROM refreshstore").all() as { data: string }[], (each) => JSON.parse(each.data));
    const trans = db.transaction((rows: RefreshToken[]) => {
      rows.forEach((row) => {
        const query = `REPLACE INTO ${STORE} (id,expiresAt,userId) VALUES ('${row.id}', '${row.expiresAt}', '${row.userId}')`;
        db.exec(query);
      });
      db.exec("DROP TABLE refreshstore");
    });
    trans.immediate(result);
  } catch {
    // nothing to see here, table already history
  }
}

class LocalPersistence {
  constructor() {
    const columns = ["id TEXT PRIMARY KEY", "expiresAt TEXT", "userId TEXT"];
    db.exec(`CREATE TABLE IF NOT EXISTS ${STORE} ( ${columns.join(",")});`);
    execWithTry(`CREATE INDEX idx_${STORE}_id ON ${STORE}(id);`);
    smoothMigrate();
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

  removeExpired: function removeExpired() {
    return persistence.removeOldTokens();
  },
};
