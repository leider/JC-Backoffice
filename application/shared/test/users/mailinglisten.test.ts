import { describe, expect, it } from "vitest";
import Users, { Mailingliste } from "../../user/users.js";
import User, { BOOKING, ORGA, SUPERUSERS } from "../../user/user.js";
import map from "lodash/map.js";

const user1 = new User({
  id: "user1",
  name: "Name of User1",
  email: "user1@jazzclub.de",
  gruppen: ORGA,
});
const user2 = new User({
  id: "user2",
  name: "Name of User2",
  email: "user2@jazzclub.de",
  gruppen: ORGA,
});
const user3 = new User({
  id: "user3",
  name: "Name of User3",
  email: "user3@jazzclub.de",
  gruppen: BOOKING,
});
const user4 = new User({
  id: "user4",
  name: "Name of User4",
  email: "user4@jazzclub.de",
  gruppen: ORGA,
});
const user5 = new User({
  id: "user5",
  name: "Name of User5",
  email: "user5@jazzclub.de",
  gruppen: BOOKING,
});
const user6 = new User({
  id: "user6",
  name: "Name of User6",
  email: "user6@jazzclub.de",
  gruppen: SUPERUSERS,
});
const user7 = new User({
  id: "user7",
  name: "Name of User7",
  email: "user7@jazzclub.de",
  gruppen: "",
});

const userCollection = [user1, user2, user3, user4, user5, user6, user7];

describe("extracts mailinglisten from many users", () => {
  it("is an empty list when no lists are there", () => {
    const users = new Users(userCollection);
    const listen = users.extractListen();
    expect(listen).to.eql([]);
  });

  it("is a list with one entry when there is only one list in many users", () => {
    const changedColl = map(userCollection, (u) => {
      const res = new User(u);
      res.mailinglisten = ["liste1"];
      return res;
    });
    const users = new Users(changedColl);
    expect(users.extractListen()).to.eql(["liste1"]);
    expect(users.getUsersInListe("liste1")).to.eql(changedColl);
    expect(users.getUsersInListe("liste2")).to.eql([]);
  });

  it("is a list with three entries when there is three lists in many users", () => {
    let count = 0;
    const changedColl = map(userCollection, (u) => {
      const res = new User(u);
      res.mailinglisten = ["liste" + ((count++ % 3) + 1)];
      return res;
    });
    const users = new Users(changedColl);
    expect(users.extractListen()).to.eql(["liste1", "liste2", "liste3"]);
    expect(map(users.getUsersInListe("liste1"), "id")).to.eql(["user1", "user4", "user7"]);
    expect(map(users.getUsersInListe("liste2"), "id")).to.eql(["user2", "user5"]);
    expect(map(users.getUsersInListe("liste3"), "id")).to.eql(["user3", "user6"]);
  });

  it("is a list with three entries when there is three lists in many users with some users having more than one list", () => {
    let count = 0;
    const changedColl = map(userCollection, (u) => {
      const res = new User(u);
      for (let i = 0; i <= count; i++) {
        res.mailinglisten.push("liste" + ((i % 3) + 1));
      }
      count++;
      return res;
    });
    const users = new Users(changedColl);
    const listen = users.extractListen();
    expect(listen).to.eql(["liste1", "liste2", "liste3"]);
    expect(map(users.getUsersInListe("liste1"), "id")).to.eql(["user1", "user2", "user3", "user4", "user5", "user6", "user7"]);
    expect(map(users.getUsersInListe("liste2"), "id")).to.eql(["user2", "user3", "user4", "user5", "user6", "user7"]);
    expect(map(users.getUsersInListe("liste3"), "id")).to.eql(["user3", "user4", "user5", "user6", "user7"]);
    expect(users.mailinglisten[0]).to.eql(new Mailingliste("liste1", changedColl));
  });
});
