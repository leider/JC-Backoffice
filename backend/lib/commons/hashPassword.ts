import crypto from "crypto";
import conf from "jc-shared/commons/simpleConfigure.js";

export function genSalt(): string {
  const length = 64;
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex") // convert to hexadecimal format
    .slice(0, length); // return required number of characters
}

export function hashPassword(password: string, givenSalt?: string): string {
  const salt = givenSalt || conf.salt || "1234567890";
  /*eslint no-sync: 0 */
  return crypto.pbkdf2Sync(password, salt, 100000, 512, "sha512").toString("hex");
}
