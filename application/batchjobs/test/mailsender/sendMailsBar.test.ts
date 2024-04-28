import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as sin from "sinon";
import "../initWinstonForTest";
import "jc-backend/configure.js";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import vermietungenstore from "jc-backend/lib/vermietungen/vermietungenstore.js";
import konzertestore from "jc-backend/lib/konzerte/konzertestore.js";
import { checkBar } from "../../src/sendMailsNightlyBar.js";
import userstore from "jc-backend/lib/users/userstore";
import { testKonzerte, testUsers, testVermietungen } from "./testObjects";

const sinon = sin.createSandbox();

describe("Bar Mailsender", () => {
  const april14 = DatumUhrzeit.forISOString("2019-04-14T18:00:00.000Z");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mailcheck: any;

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
    expect(message.to).to.equal('"Bar Name" <bar.email@gmx.net>');
    expect(message.markdown).to.include("## An folgenden Terminen haben wir Veranstaltungen im Jazzclub:");
    expect(message.markdown).to.include("So., 28. Apr. 2019 22:00 bis 01:00 - Vermietung 1");
    expect(message.markdown).to.include("Mo., 29. Apr. 2019 22:00 bis 01:00 - Konzert 1");
    expect(message.markdown).to.include("Mi., 29. Mai 2019 22:00 bis 01:00 - Konzert 2");
    expect(message.markdown).to.include("Sa., 29. Juni 2019 22:00 bis 01:00 - Konzert 3");
    expect(message.markdown).to.include("Mo., 29. Juli 2019 22:00 bis 01:00 - Konzert 4");
  });
});
