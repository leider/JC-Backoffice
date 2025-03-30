import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as sin from "sinon";
import "../initWinstonForTest";
import "../../configure.js";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import mailtransport from "../../lib/mailsender/mailtransport.js";
import vermietungenstore from "../../lib/vermietungen/vermietungenstore.js";
import konzertestore from "../../lib/konzerte/konzertestore.js";
import userstore from "../../lib/users/userstore.js";
import { testKonzerte, testUsers, testVermietungen } from "./testObjects.js";
import mailstore from "../../lib/mailsender/mailstore.js";
import MailRule from "jc-shared/mail/mailRule.js";
import { checkPressetexte } from "../../batches/sendMailsPressetextFehlt.js";

const sinon = sin.createSandbox();

describe("Rules Mailsender", () => {
  const april17 = DatumUhrzeit.forISOString("2019-04-17T18:00:00.000Z");

  let mailcheck: sin.SinonStub;

  const rule1 = new MailRule({
    name: "Regel 1",
    email: "regel@gmail.com",
    rule: "Mittwochs für die nächste Woche",
  });

  const mailRules = [rule1];

  beforeEach(() => {
    sinon.stub(vermietungenstore, "byDateRangeInAscendingOrder").returns(testVermietungen);
    sinon.stub(konzertestore, "byDateRangeInAscendingOrder").returns(testKonzerte);
    sinon.stub(userstore, "allUsers").returns(testUsers);
    sinon.stub(mailstore, "all").returns(mailRules);
    mailcheck = sinon.stub(mailtransport, "sendMail").resolves(undefined);
  });

  afterEach(() => {
    sinon.restore();
  });

  it("runs correctly on a day where notificatons lie", async () => {
    await checkPressetexte(april17);
    sinon.assert.calledOnce(mailcheck);
    const message = mailcheck.args[0][0];
    expect(message.subject).to.equal("Veranstaltungen ohne Pressetext");
    expect(message.bcc).to.eql([
      { address: "user3@jazzclub.de", name: "Name of User3" },
      { address: "user4@jazzclub.de", name: "Name of User4" },
      { address: "user5@jazzclub.de", name: "Name of User5" },
    ]);
    expect(message.body).to.include(
      "## Folgende Veranstaltungen oder Vermietungen haben noch keinen Pressetext und werden im Laufe der nächsten Woche der Presse angekündigt:",
    );

    expect(message.body).to.include(`### [Vermietung 2](http://localhost:1970/vermietung/?page=presse)
#### Dienstag, 28. Mai 2019 um 22:00 im Jazzclub Karlsruhe`);

    expect(message.body).to.include(`### [Konzert 2](http://localhost:1970/konzert/konzert2?page=presse)
#### Mittwoch, 29. Mai 2019 um 22:00 im Jazzclub Karlsruhe`);

    expect(message.body).to.include(`### [Konzert 3](http://localhost:1970/konzert/?page=presse)
#### Samstag, 29. Juni 2019 um 22:00 im Jazzclub Karlsruhe`);

    expect(message.body, "Konzert 4 braucht keine Presse").to.not.include(`### [Konzert 4]`);
  });
});
