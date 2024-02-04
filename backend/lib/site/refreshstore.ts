import pers from "../persistence/sqlitePersistence.js";
const persistence = pers("refreshstore");

export interface RefreshToken {
  id: string;
  userId: string;
  expiresAt: Date;
}

export default {
  save: async function save(refreshToken: RefreshToken) {
    await persistence.save(refreshToken);
    return refreshToken;
  },

  forId: async function forId(id: string) {
    return persistence.getById(id);
  },

  removeExpired: async function removeExpired() {
    return persistence.removeWithQuery(`data->>'$.expiresAt' < '${new Date().toJSON()}';`);
  },
};
