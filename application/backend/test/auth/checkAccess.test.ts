import { describe, expect, it, vi } from "vitest";
import "../initWinstonForTest.js";
import "../../configure.js";

import User, { ABENDKASSE, BOOKING, ORGA, SUPERUSERS } from "jc-shared/user/user.js";
import { checkAbendkasse, checkCanEditUser, checkOrgateam, checkSuperuser } from "../../rest/checkAccessHandlers.js";
import { NextFunction, Request, Response } from "express";

function mockReqResNext(user: User, bodyId?: string) {
  const req = { user, body: { id: bodyId } } as unknown as Request;
  const res = { sendStatus: vi.fn() } as unknown as Response;
  const next = vi.fn() as unknown as NextFunction;
  return { req, res, next };
}

describe("checkAccessHandlers", () => {
  const superuser = new User({ id: "su", gruppen: SUPERUSERS });
  const bookingUser = new User({ id: "booker", gruppen: BOOKING });
  const orgaUser = new User({ id: "orga", gruppen: ORGA });
  const kasseUser = new User({ id: "kasse", gruppen: ABENDKASSE });
  const nobody = new User({ id: "nobody", gruppen: "" });

  describe("checkSuperuser", () => {
    it("allows superuser", async () => {
      const { req, res, next } = mockReqResNext(superuser);
      await checkSuperuser(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.sendStatus).not.toHaveBeenCalled();
    });

    it("rejects booking user", async () => {
      const { req, res, next } = mockReqResNext(bookingUser);
      await checkSuperuser(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects orga user", async () => {
      const { req, res, next } = mockReqResNext(orgaUser);
      await checkSuperuser(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledWith(403);
    });
  });

  describe("checkOrgateam", () => {
    it("allows superuser", async () => {
      const { req, res, next } = mockReqResNext(superuser);
      await checkOrgateam(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("allows booking user", async () => {
      const { req, res, next } = mockReqResNext(bookingUser);
      await checkOrgateam(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("allows orga user", async () => {
      const { req, res, next } = mockReqResNext(orgaUser);
      await checkOrgateam(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("rejects kasse user", async () => {
      const { req, res, next } = mockReqResNext(kasseUser);
      await checkOrgateam(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledWith(403);
    });

    it("rejects nobody", async () => {
      const { req, res, next } = mockReqResNext(nobody);
      await checkOrgateam(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledWith(403);
    });
  });

  describe("checkAbendkasse", () => {
    it("allows kasse user", async () => {
      const { req, res, next } = mockReqResNext(kasseUser);
      await checkAbendkasse(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("allows orga user", async () => {
      const { req, res, next } = mockReqResNext(orgaUser);
      await checkAbendkasse(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("rejects nobody", async () => {
      const { req, res, next } = mockReqResNext(nobody);
      await checkAbendkasse(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledWith(403);
    });
  });

  describe("checkCanEditUser", () => {
    it("allows superuser to edit any user", async () => {
      const { req, res, next } = mockReqResNext(superuser, "someone-else");
      await checkCanEditUser(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("allows user to edit themselves", async () => {
      const { req, res, next } = mockReqResNext(orgaUser, "orga");
      await checkCanEditUser(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("rejects non-superuser editing another user", async () => {
      const { req, res, next } = mockReqResNext(orgaUser, "someone-else");
      await checkCanEditUser(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledWith(403);
    });
  });
});
