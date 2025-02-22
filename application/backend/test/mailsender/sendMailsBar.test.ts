import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as sin from "sinon";
import "../initWinstonForTest";
import "../../configure.js";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import mailtransport from "../../lib/mailsender/mailtransport.js";
import vermietungenstore from "../../lib/vermietungen/vermietungenstore.js";
import konzertestore from "../../lib/konzerte/konzertestore.js";
import { checkBar } from "../../batches/sendMailsNightlyBar.js";
import userstore from "../../lib/users/userstore.js";
import { testKonzerte, testUsers, testVermietungen } from "./testObjects.js";

const sinon = sin.createSandbox();

describe("Bar Mailsender", () => {
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

  it("runs correctly on a day where notificatons lie", async () => {
    await checkBar(april14);
    sinon.assert.calledOnce(mailcheck);
    const message = mailcheck.args[0][0];
    expect(message.subject).to.equal("Jazzclub Bar Termine");
    expect(message.to).to.eql([{ address: "bar.email@gmx.net", name: "Bar Name" }]);
    expect(message.body).to.include("## An folgenden Terminen haben wir Veranstaltungen im Jazzclub:");
    expect(message.body).to.include("So., 28. Apr. 2019 22:00 bis 01:00 - Vermietung 1");
    expect(message.body).to.include("Mo., 29. Apr. 2019 22:00 bis 01:00 - Konzert 1 (Wir erwarten 10 Besucher)");
    expect(message.body).to.include("Mi., 29. Mai 2019 22:00 bis 01:00 - Konzert 2");
    expect(message.body).to.include("Sa., 29. Juni 2019 22:00 bis 01:00 - Konzert 3");
    expect(message.body).to.include("Mo., 29. Juli 2019 22:00 bis 01:00 - Konzert 4");
  });
});
