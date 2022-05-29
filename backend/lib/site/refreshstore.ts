import pers from "../persistence/persistenceNew";
const persistence = pers("refreshstore");

export interface RefreshToken {
  id: string;
  userId: string;
  expiresAt: Date;
}

export default {
  save: async function save(refreshToken: RefreshToken) {
    return persistence.save(refreshToken);
  },

  forId: async function forId(id: string) {
    return persistence.getById(id);
  },

  remove: async function remove(id: string) {
    return persistence.removeById(id);
  },
};
