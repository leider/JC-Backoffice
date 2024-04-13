import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as sin from "sinon";
import "jc-backend/configure.js";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import vermietungenstore from "jc-backend/lib/vermietungen/vermietungenstore.js";
import Vermietung from "jc-shared/vermietung/vermietung.js";
import konzertestore from "jc-backend/lib/konzerte/konzertestore.js";
import Konzert from "jc-shared/konzert/konzert.js";
import User, { ABENDKASSE, BOOKING, ORGA, SUPERUSERS } from "jc-shared/user/user";
import userstore from "jc-backend/lib/users/userstore";
import { checkKasse } from "../../src/sendMailsKasseFehlt";

const sinon = sin.createSandbox();

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

const users = [user1, user2, user3, user4, user5];

describe("Check Kasse Mailsender", () => {
  const april14 = DatumUhrzeit.forISOString("2019-04-14T18:00:00.000Z");

  const vermietung1 = new Vermietung({
    startDate: "2019-04-28T20:00:00.000Z",
    endDate: "2019-04-28T23:00:00.000Z",
    brauchtBar: true,
    kopf: { confirmed: true, ort: "Jazzclub", titel: "Vermietung 1" },
  });
  const vermietungen = [vermietung1];

  const konzert1 = new Konzert({
    startDate: "2019-04-29T20:00:00.000Z",
    endDate: "2019-04-29T23:00:00.000Z",
    url: "konzert1",
    kopf: { titel: "Konzert 1", ort: "Jazzclub", confirmed: true },
    staff: { kasseNotNeeded: false },
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
    kopf: { confirmed: true },
    staff: { kasseVNotNeeded: true, kasseNotNeeded: true },
  });
  const konzert4 = new Konzert({
    startDate: "2019-07-29T20:00:00.000Z",
    endDate: "2019-07-29T23:00:00.000Z",
    kopf: { confirmed: true },
    staff: { kasseVNotNeeded: false, kasseV: ["user1"] },
  });
  const konzerte = [konzert1, konzert2, konzert3, konzert4];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mailcheck: any;

  beforeEach(() => {
    sinon.stub(vermietungenstore, "byDateRangeInAscendingOrder").returns(vermietungen);
    sinon.stub(konzertestore, "byDateRangeInAscendingOrder").returns(konzerte);
    sinon.stub(userstore, "allUsers").returns(users);
    mailcheck = sinon.stub(mailtransport, "sendMail").resolves(undefined);
  });

  afterEach(() => {
    sinon.restore();
  });

  it("sends the right emails", async () => {
    await checkKasse(april14 as DatumUhrzeit);
    sinon.assert.calledOnce(mailcheck);
    const message = mailcheck.args[0][0];
    expect(message.subject).to.equal("Kassenpersonal für Veranstaltungen gesucht");
    expect(message.bcc).to.equal('"Name of User1" <user1@jazzclub.de>,user5@jazzclub.de');
    expect(message.markdown).to.equal(`## Bei folgenden Veranstaltungen der nächsten 8 Tage fehlt noch jemand an der Kasse:

---
<a href="http://localhost:1970/vue/veranstaltung/konzert1">Konzert 1 am Mo., 29. Apr. 2019 22:00 im Jazzclub Karlsruhe</a>

---
<a href="http://localhost:1970/vue/veranstaltung/konzert2">Konzert 2 am Mi., 29. Mai 2019 22:00 im Jazzclub Karlsruhe</a>

--- 
<a href="http://localhost:1970/vue/team/">Zur Teamseite</a>`);
  });
});
