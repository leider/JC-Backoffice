import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as sin from "sinon";
import "../initWinstonForTest";
import "../../configure.js";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import mailtransport from "../../lib/mailsender/mailtransport.js";
import vermietungenstore from "../../lib/vermietungen/vermietungenstore.js";
import konzertestore from "../../lib/konzerte/konzertestore.js";
import userstore from "../../lib/users/userstore.js";
import { checkKasse } from "../../batches/sendMailsKasseFehlt.js";
import { testKonzerte, testUsers, testVermietungen } from "./testObjects.js";

const sinon = sin.createSandbox();

describe("Check Kasse Mailsender", () => {
  const april14 = DatumUhrzeit.forISOString("2019-04-14T18:00:00.000Z");

  let mailcheck: sin.SinonStub;

  beforeEach(() => {
    sinon.stub(vermietungenstore, "byDateRangeInAscendingOrder").returns(testVermietungen);
    sinon.stub(konzertestore, "byDateRangeInAscendingOrder").returns(testKonzerte);
    sinon.stub(userstore, "allUsers").returns(testUsers);
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
    expect(message.bcc).to.eql([
      { address: "user1@jazzclub.de", name: "Name of User1" },
      { address: "user5@jazzclub.de", name: "Name of User5" },
    ]);
    expect(message.body).to.include("## Bei folgenden Veranstaltungen der nächsten 8 Tage fehlt noch jemand an der Kasse:");
    expect(message.body).to.include(
      '<a href="http://localhost:1970/vue/veranstaltung/konzert1">Konzert 1 am Mo., 29. Apr. 2019 22:00 im Jazzclub Karlsruhe</a>',
    );
    expect(message.body).to.include(
      '<a href="http://localhost:1970/vue/veranstaltung/konzert2">Konzert 2 am Mi., 29. Mai 2019 22:00 im Jazzclub Karlsruhe</a>',
    );
  });
});
