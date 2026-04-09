/* eslint-disable sonarjs/no-hardcoded-passwords */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as sin from "sinon";
import "../initWinstonForTest.js";
import "../../configure.js";

import usersService from "../../lib/users/usersService.js";
import userstore from "../../lib/users/userstore.js";
import { hashPassword } from "../../lib/commons/hashPassword.js";
import User, { SUPERUSERS } from "jc-shared/user/user.js";

const sinon = sin.createSandbox();
const adminUser = new User({ id: "admin", name: "Admin", gruppen: SUPERUSERS });

describe("usersService", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("saveNewUserWithPassword", () => {
    beforeEach(() => {
      sinon.stub(userstore, "forId").returns(null);
      sinon.stub(userstore, "save").callsFake((user) => user);
    });

    it("hashes the password and sets salt", () => {
      const newUser = new User({ id: "newuser", name: "New User", password: "secret123" });

      usersService.saveNewUserWithPassword(newUser, adminUser);

      expect(newUser.hashedPassword).toBeDefined();
      expect(newUser.hashedPassword!.length).toBeGreaterThan(0);
      expect(newUser.salt).toBeDefined();
      expect(newUser.salt!.length).toBe(64);
    });

    it("produces a verifiable hash", () => {
      const newUser = new User({ id: "newuser", name: "New User", password: "secret123" });

      usersService.saveNewUserWithPassword(newUser, adminUser);

      const rehashed = hashPassword("secret123", newUser.salt);
      expect(newUser.hashedPassword).toBe(rehashed);
    });

    it("removes plaintext password from user object", () => {
      const newUser = new User({ id: "newuser", name: "New User", password: "secret123" });

      usersService.saveNewUserWithPassword(newUser, adminUser);

      expect(newUser.password).toBeUndefined();
    });

    it("calls store.save with the user", () => {
      const newUser = new User({ id: "newuser", name: "New User", password: "secret123" });

      usersService.saveNewUserWithPassword(newUser, adminUser);

      expect((userstore.save as sin.SinonStub).calledOnce).toBe(true);
    });
  });

  describe("saveNewUserWithPassword – validation", () => {
    it("throws when password is missing", () => {
      sinon.stub(userstore, "forId").returns(null);
      const newUser = new User({ id: "newuser", name: "New User" });

      expect(() => usersService.saveNewUserWithPassword(newUser, adminUser)).toThrow("Kein Passwort");
    });

    it("throws when user already exists", () => {
      sinon.stub(userstore, "forId").returns(new User({ id: "existing" }));
      const newUser = new User({ id: "existing", name: "Duplicate", password: "pw" });

      expect(() => usersService.saveNewUserWithPassword(newUser, adminUser)).toThrow("existiert schon");
    });
  });

  describe("changePassword", () => {
    it("updates hash and salt on existing user", () => {
      const existing = new User({ id: "existing", name: "Existing", hashedPassword: "oldhash", salt: "oldsalt" });
      sinon.stub(userstore, "forId").returns(existing);
      sinon.stub(userstore, "save").callsFake((user) => user);

      const userWithNewPw = new User({ id: "existing", password: "newpass" });
      usersService.changePassword(userWithNewPw, adminUser);

      expect(existing.salt).not.toBe("oldsalt");
      expect(existing.hashedPassword).not.toBe("oldhash");
      const rehashed = hashPassword("newpass", existing.salt);
      expect(existing.hashedPassword).toBe(rehashed);
    });

    it("returns null when user does not exist", () => {
      sinon.stub(userstore, "forId").returns(null);
      const userWithNewPw = new User({ id: "ghost", password: "pw" });

      const result = usersService.changePassword(userWithNewPw, adminUser);
      expect(result).toBeNull();
    });

    it("throws when password is missing", () => {
      const user = new User({ id: "existing" });
      expect(() => usersService.changePassword(user, adminUser)).toThrow("Kein Passwort");
    });
  });
});
