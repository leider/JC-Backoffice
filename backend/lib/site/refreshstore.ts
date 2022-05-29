import pers from "../persistence/persistence";
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

  remove: async function remove(id: string) {
    return persistence.removeById(id);
  },
};
