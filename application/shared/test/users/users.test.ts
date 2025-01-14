import { describe, expect, it } from "vitest";

import Users from "../../user/users.js";
import User, { ABENDKASSE, BOOKING, ORGA, SUPERUSERS } from "../../user/user.js";
import map from "lodash/map.js";

const user1 = new User({
  id: "user1",
  name: "Name of User1",
  email: "user1@jazzclub.de",
  kannLicht: true,
  gruppen: ORGA,
});
const user2 = new User({
  id: "user2",
  name: "Name of User2",
  email: "user2@jazzclub.de",
  kannKasse: true,
  gruppen: ORGA,
});
const user3 = new User({
  id: "user3",
  name: "Name of User3",
  email: "user3@jazzclub.de",
  kannErsthelfer: true,
  kannTon: true,
  gruppen: BOOKING,
});
const user4 = new User({
  id: "user4",
  name: "Name of User4",
  email: "user4@jazzclub.de",
  gruppen: ABENDKASSE,
});
const user5 = new User({
  id: "user5",
  name: "Name of User5",
  email: "user5@jazzclub.de",
  kannErsthelfer: true,
  gruppen: ORGA,
  mailinglisten: ["liste1"],
});
const superuser = new User({
  id: "superuser",
  name: "Name of User6",
  email: "superuser@jazzclub.de",
  kannMaster: true,
  kannErsthelfer: true,
  gruppen: SUPERUSERS,
});
const user7 = new User({
  id: "user7",
  name: "Name of User7",
  email: "user7@jazzclub.de",
  gruppen: "",
});

const userCollection = [user1, user2, user3, user4, user5, superuser, user7];

describe("Users", () => {
  describe("getUsersInGruppenExact", () => {
    it('gives users being "superuser"', () => {
      const superusers = new Users(userCollection).getUsersInGruppenExact(["superusers"]);
      expect(map(superusers, "id")).to.eql(["superuser"]);
    });

    it('gives users being "abendkasse"', () => {
      const abendkasse = new Users(userCollection).getUsersInGruppenExact(["abendkasse"]);
      expect(map(abendkasse, "id")).to.eql(["user4"]);
    });

    it('gives users being "orgaTeam"', () => {
      const orgaTeam = new Users(userCollection).getUsersInGruppenExact(["orgaTeam"]);
      expect(map(orgaTeam, "id")).to.eql(["user1", "user2", "user5"]);
    });

    it('gives users being "bookingTeam"', () => {
      const bookingTeam = new Users(userCollection).getUsersInGruppenExact(["bookingTeam"]);
      expect(map(bookingTeam, "id")).to.eql(["user3"]);
    });

    it('gives users being "bookingTeam" and "orgaTeam"', () => {
      const bookingTeam = new Users(userCollection).getUsersInGruppenExact(["bookingTeam", "orgaTeam"]);
      expect(map(bookingTeam, "id")).to.eql(["user1", "user2", "user3", "user5"]);
    });
  });

  describe("getUsersKannOneOf", () => {
    it('gives users being "Kasse"', () => {
      const kasse = new Users(userCollection).getUsersKannOneOf(["Kasse"]);
      expect(map(kasse, "id")).to.eql(["user2"]);
    });

    it('gives users being "Licht"', () => {
      const licht = new Users(userCollection).getUsersKannOneOf(["Licht"]);
      expect(map(licht, "id")).to.eql(["user1"]);
    });

    it('gives users being "Ton"', () => {
      const ton = new Users(userCollection).getUsersKannOneOf(["Ton"]);
      expect(map(ton, "id")).to.eql(["user3"]);
    });

    it('gives users being "Master"', () => {
      const master = new Users(userCollection).getUsersKannOneOf(["Master"]);
      expect(map(master, "id")).to.eql(["superuser"]);
    });

    it('gives users being "Ersthelfer"', () => {
      const ersthelfer = new Users(userCollection).getUsersKannOneOf(["Ersthelfer"]);
      expect(map(ersthelfer, "id")).to.eql(["user3", "user5", "superuser"]);
    });

    it('gives users being "Ersthelfer", "Ton", "Licht"', () => {
      const ersthelfer = new Users(userCollection).getUsersKannOneOf(["Ersthelfer", "Ton", "Licht"]);
      expect(map(ersthelfer, "id")).to.eql(["user1", "user3", "user5", "superuser"]);
    });
  });

  describe("can extract receivers for mails", () => {
    it("when nothing is provided", () => {
      const groupsFromBody: string[] = [];
      const userFromBody: string[] = [];
      const result = new Users(userCollection).filterReceivers(groupsFromBody, userFromBody, []);
      expect(result).to.eql([]);
    });

    it("when orgaTeam provided", () => {
      const groupsFromBody = [ORGA];
      const userFromBody: string[] = [];
      const result = new Users(userCollection).filterReceivers(groupsFromBody, userFromBody, []);
      expect(result).to.contain(user1);
      expect(result).to.contain(user2);
      expect(result).to.contain(user5);
      expect(result).to.contain(superuser);
    });

    it("when bookingTeam provided", () => {
      const groupsFromBody = [BOOKING];
      const userFromBody: string[] = [];
      const result = new Users(userCollection).filterReceivers(groupsFromBody, userFromBody, []);
      expect(result).to.contain(user3);
      expect(result).to.contain(superuser);
    });

    it("when orageTeam AND bookingTeam provided", () => {
      const groupsFromBody = [BOOKING, ORGA];
      const userFromBody: string[] = [];
      const result = new Users(userCollection).filterReceivers(groupsFromBody, userFromBody, []);
      expect(result).to.have.length(5);
      expect(result).to.contain(user1);
      expect(result).to.contain(user2);
      expect(result).to.contain(user3);
      expect(result).to.contain(user5);
      expect(result).to.contain(superuser);
    });

    it("when any non-existing team provided superuser is always added", () => {
      const groupsFromBody = ["weired"];
      const userFromBody = ["user1"];
      const result = new Users(userCollection).filterReceivers(groupsFromBody, userFromBody, []);
      expect(result).to.contain(user1);
      expect(result).to.contain(superuser);
    });

    it('when "alle" provided', () => {
      const groupsFromBody = ["alle"];
      const userFromBody = ["user1"];
      const result = new Users(userCollection).filterReceivers(groupsFromBody, userFromBody, []);
      expect(result).to.contain(user1);
      expect(result).to.contain(user2);
      expect(result).to.contain(user3);
      expect(result).to.contain(user4);
      expect(result).to.contain(user5);
      expect(result).to.contain(superuser);
      expect(result).to.contain(user7);
    });

    it("when no team provided userFromBody is taken", () => {
      const groupsFromBody: string[] = [];
      const userFromBody = ["user1", "user4"];
      const result = new Users(userCollection).filterReceivers(groupsFromBody, userFromBody, []);
      expect(result).to.contain(user1);
      expect(result).to.contain(user4);
    });

    it("when a list is provided finds the according user", () => {
      const groupsFromBody: string[] = [];
      const result = new Users(userCollection).filterReceivers(groupsFromBody, [], ["liste1"]);
      expect(result).to.contain(user5);
    });
  });
});
