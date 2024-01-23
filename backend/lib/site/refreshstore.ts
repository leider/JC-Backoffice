import pers from "../persistence/persistence.js";
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
    return persistence.removeWithQuery({ expiresAt: { $lt: new Date() } });
  },

  removeWithOldId: async function removeWithOldId(oldId: string) {
    return persistence.removeWithQuery({ id: { $eq: oldId } });
  },
};
