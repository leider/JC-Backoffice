import { describe, expect, it } from "vitest";

import Users from "../../user/users.js";
import User from "../../user/user.js";

const user1 = new User({
  id: "user1",
  name: "Name of User1",
  email: "user1@jazzclub.de",
  gruppen: ["orgaTeam"],
});
const user2 = new User({
  id: "user2",
  name: "Name of User2",
  email: "user2@jazzclub.de",
  gruppen: ["orgaTeam"],
});
const user3 = new User({
  id: "user3",
  name: "Name of User3",
  email: "user3@jazzclub.de",
  gruppen: ["bookingTeam"],
});
const user4 = new User({
  id: "user4",
  name: "Name of User4",
  email: "user4@jazzclub.de",
  gruppen: ["bookingTeam", "orgaTeam"],
});
const user5 = new User({
  id: "user5",
  name: "Name of User5",
  email: "user5@jazzclub.de",
  gruppen: ["bookingTeam", "orgaTeam", "superusers"],
  mailinglisten: ["liste1"],
});
const superuser = new User({
  id: "superuser",
  name: "Name of User6",
  email: "superuser@jazzclub.de",
  gruppen: ["superusers"],
});
const user7 = new User({
  id: "user7",
  name: "Name of User7",
  email: "user7@jazzclub.de",
  gruppen: [],
});

const userCollection = [user1, user2, user3, user4, user5, superuser, user7];

describe("Users can extract receivers for mails", () => {
  it("when nothing is provided", () => {
    const groupsFromBody: string[] = [];
    const userFromBody: string[] = [];
    const result = new Users(userCollection).filterReceivers(groupsFromBody, userFromBody, []);
    expect(result).to.eql([]);
  });

  it("when orgaTeam provided", () => {
    const groupsFromBody = ["orgaTeam"];
    const userFromBody: string[] = [];
    const result = new Users(userCollection).filterReceivers(groupsFromBody, userFromBody, []);
    expect(result).to.contain(user1);
    expect(result).to.contain(user2);
    expect(result).to.contain(user4);
    expect(result).to.contain(user5);
    expect(result).to.contain(superuser);
  });

  it("when bookingTeam provided", () => {
    const groupsFromBody = ["bookingTeam"];
    const userFromBody: string[] = [];
    const result = new Users(userCollection).filterReceivers(groupsFromBody, userFromBody, []);
    expect(result).to.contain(user3);
    expect(result).to.contain(user4);
    expect(result).to.contain(user5);
    expect(result).to.contain(superuser);
  });

  it("when orageTeam AND bookingTeam provided", () => {
    const groupsFromBody = ["bookingTeam", "orgaTeam"];
    const userFromBody: string[] = [];
    const result = new Users(userCollection).filterReceivers(groupsFromBody, userFromBody, []);
    expect(result).to.have.length(6);
    expect(result).to.contain(user1);
    expect(result).to.contain(user2);
    expect(result).to.contain(user3);
    expect(result).to.contain(user4);
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
