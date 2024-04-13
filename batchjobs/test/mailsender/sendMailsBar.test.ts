import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as sin from "sinon";
import "jc-backend/configure.js";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import vermietungenstore from "jc-backend/lib/vermietungen/vermietungenstore.js";
import Vermietung from "jc-shared/vermietung/vermietung.js";
import konzertestore from "jc-backend/lib/konzerte/konzertestore.js";
import Konzert from "jc-shared/konzert/konzert.js";
import { checkBar } from "../../src/sendMailsNightlyBar.js";
import userstore from "jc-backend/lib/users/userstore";
import User, { BOOKING, ORGA, SUPERUSERS } from "jc-shared/user/user";

const sinon = sin.createSandbox();

const admin = new User({
  id: "admin",
  name: "Name of User5",
  email: "user5@jazzclub.de",
  gruppen: [BOOKING, ORGA, SUPERUSERS],
  mailinglisten: ["liste1"],
});

const users = [admin];

describe("Bar Mailsender", () => {
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
    kopf: { titel: "Konzert 1", ort: "Jazzclub", confirmed: true },
  });
  const konzerte = [konzert1];

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

  it("runs correctly on a day where notificatons lie", async () => {
    await checkBar(april14 as DatumUhrzeit);
    sinon.assert.calledOnce(mailcheck);
    const message = mailcheck.args[0][0];
    expect(message.subject).to.equal("Jazzclub Bar Termine");
    expect(message.markdown).to.equal(`## An folgenden Terminen haben wir Veranstaltungen im Jazzclub:

---
So., 28. Apr. 2019 22:00 bis 01:00 - Vermietung 1

---
Mo., 29. Apr. 2019 22:00 bis 01:00 - Konzert 1`);
  });
});
