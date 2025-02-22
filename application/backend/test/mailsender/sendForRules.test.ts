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
import { loadRulesAndProcess } from "../../batches/sendMailsForRules.js";
import mailstore from "../../lib/mailsender/mailstore.js";
import MailRule from "jc-shared/mail/mailRule.js";

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

  it("runs correctly on a day where notifications lie", async () => {
    await loadRulesAndProcess(april17);
    sinon.assert.calledOnce(mailcheck);
    const message = mailcheck.args[0][0];
    expect(message.subject).to.equal("[Jazzclub Karlsruhe] KW 17 bis 17");
    expect(message.to).to.eql([{ address: "regel@gmail.com", name: "Regel 1" }]);
    expect(message.body).to.include(`### Automatischer Mailversand des Jazzclub Karlruhe e.V.
Diese Mail ist automatisch generiert. Bitte informieren Sie uns über Verbesserungen oder Änderungswünsche, speziell bzgl. des Sendedatums, der Sendeperiode und des Anfangs- und Endezeitraums.

Liebe Grüße vom Jazzclub Team.`);

    expect(message.body).to.include(`### Vermietung 1
#### Sonntag, 28. April 2019 um 22:00 im Jazzclub Karlsruhe`);

    expect(message.body).to.include(`### Konzert 1
#### Montag, 29. April 2019 um 22:00 im Jazzclub Karlsruhe
**Eintritt:** freier Eintritt`);
  });
});
