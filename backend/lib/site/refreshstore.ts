import pers from "../persistence/persistence";
const persistence = pers("refreshstore");

export interface RefreshToken {
  id: string;
  userId: string;
  expiresAt: Date;
}

export default {
  save: function save(refreshToken: RefreshToken, callback: Function): void {
    persistence.save(refreshToken, callback);
  },

  forId: function forId(id: string, callback: Function): void {
    persistence.getById(id, callback);
  },

  remove: function remove(id: string, callback: Function): void {
    persistence.removeById(id, callback);
  },
};
