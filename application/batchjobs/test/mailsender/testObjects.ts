import User, { ABENDKASSE, BOOKING, ORGA, SUPERUSERS } from "jc-shared/user/user.js";
import Vermietung from "jc-shared/vermietung/vermietung.js";
import Konzert from "jc-shared/konzert/konzert.js";

// Users
const user1 = new User({
  id: "user1",
  name: "Name of User1",
  email: "user1@jazzclub.de",
  gruppen: [ORGA],
  kannKasse: true,
  wantsEmailReminders: true,
});
const user2 = new User({
  id: "user2",
  name: "Name of User2",
  email: "user2@jazzclub.de",
  gruppen: [ABENDKASSE],
});
const user3 = new User({
  id: "user3",
  name: "Name of User3",
  email: "user3@jazzclub.de",
  gruppen: [BOOKING],
  kannKasse: true,
});
const user4 = new User({
  id: "user4",
  name: "Name of User4",
  email: "user4@jazzclub.de",
  gruppen: [BOOKING, ORGA],
});
const user5 = new User({
  id: "user5",
  name: "Name of User5",
  email: "user5@jazzclub.de",
  gruppen: [BOOKING, ORGA, SUPERUSERS],
  mailinglisten: ["liste1"],
});

// Vermietungen
const vermietung1 = new Vermietung({
  startDate: "2019-04-28T20:00:00.000Z",
  endDate: "2019-04-28T23:00:00.000Z",
  brauchtBar: true,
  brauchtPresse: true,
  kopf: { confirmed: true, ort: "Jazzclub", titel: "Vermietung 1" },
  presse: { checked: true },
});

// Konzerte
const konzert1 = new Konzert({
  startDate: "2019-04-29T20:00:00.000Z",
  endDate: "2019-04-29T23:00:00.000Z",
  url: "konzert1",
  kopf: { titel: "Konzert 1", ort: "Jazzclub", confirmed: true },
  staff: { kasseNotNeeded: false },
  presse: { checked: true },
});
const konzert2 = new Konzert({
  startDate: "2019-05-29T20:00:00.000Z",
  endDate: "2019-05-29T23:00:00.000Z",
  url: "konzert2",
  kopf: { titel: "Konzert 2", ort: "Jazzclub", confirmed: true },
  staff: { kasseVNotNeeded: false },
});
const konzert3 = new Konzert({
  startDate: "2019-06-29T20:00:00.000Z",
  endDate: "2019-06-29T23:00:00.000Z",
  kopf: { titel: "Konzert 3", ort: "Jazzclub", confirmed: true },
  staff: { kasseVNotNeeded: true, kasseNotNeeded: true },
});
const konzert4 = new Konzert({
  startDate: "2019-07-29T20:00:00.000Z",
  endDate: "2019-07-29T23:00:00.000Z",
  kopf: { titel: "Konzert 4", ort: "Jazzclub", confirmed: true },
  staff: { kasseVNotNeeded: false, kasseV: ["user1"] },
});

export const testUsers = [user1, user2, user3, user4, user5];
export const testVermietungen = [vermietung1];
export const testKonzerte = [konzert1, konzert2, konzert3, konzert4];
