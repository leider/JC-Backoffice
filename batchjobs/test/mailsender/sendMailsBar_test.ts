import { expect } from "chai";
import sin from "sinon";
import "jc-backend/configure.js";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import vermietungenstore from "jc-backend/lib/vermietungen/vermietungenstore.js";
import Vermietung from "jc-shared/vermietung/vermietung.js";
import konzertestore from "jc-backend/lib/konzerte/konzertestore.js";
import Konzert from "jc-shared/konzert/konzert.js";
import { checkBar } from "../../src/sendMailsNightlyBar.js";

const sinon = sin.createSandbox();

describe.skip("Bar Mailsender", () => {
  const april14 = DatumUhrzeit.forISOString("2019-04-14T18:00:00.000Z");

  const vermietung1 = new Vermietung({ startDate: "2019-04-29", brauchtBar: true, kopf: { confirmed: true, ort: "Jazzclub" } });
  const vermietungen = [vermietung1];

  const konzert1 = new Konzert();
  const konzerte = [konzert1];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mailcheck: any;

  beforeEach(() => {
    sinon.stub(vermietungenstore, "byDateRangeInAscendingOrder").resolves(vermietungen);
    sinon.stub(konzertestore, "byDateRangeInAscendingOrder").resolves(konzerte);
    mailcheck = sinon.stub(mailtransport, "sendMail").resolves(undefined);
  });

  afterEach(() => {
    sinon.restore();
  });

  it("runs correctly on a day where notificatons lie", async () => {
    await checkBar(april14 as DatumUhrzeit);
    sinon.assert.calledOnce(mailcheck);
    const message = mailcheck.args[0][0];
    expect(message.senderAddress("bo@jazzclub.de")).to.equal("bo@jazzclub.de");
    expect(message.subject).to.equal("Jazzclub Bar Termine");
  });
});
