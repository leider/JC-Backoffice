import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as sin from "sinon";
import "../initWinstonForTest";
import "jc-backend/configure.js";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import vermietungenstore from "jc-backend/lib/vermietungen/vermietungenstore.js";
import konzertestore from "jc-backend/lib/konzerte/konzertestore.js";
import userstore from "jc-backend/lib/users/userstore";
import { testKonzerte, testUsers, testVermietungen } from "./testObjects";
import mailstore from "jc-backend/lib/mailsender/mailstore";
import MailRule from "jc-shared/mail/mailRule";
import { checkPressetexte } from "../../src/sendMailsPressetextFehlt";

const sinon = sin.createSandbox();

describe("Rules Mailsender", () => {
  const april17 = DatumUhrzeit.forISOString("2019-04-17T18:00:00.000Z");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mailcheck: any;

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
    expect(message.bcc).to.equal("user3@jazzclub.de,user4@jazzclub.de,user5@jazzclub.de");
    expect(message.markdown).to.include(
      "## Folgende Veranstaltungen oder Vermietungen haben noch keinen Pressetext und werden im Laufe der nächsten Woche der Presse angekündigt:",
    );

    expect(message.markdown).to.include(`### [Vermietung 2](http://localhost:1970/vue/vermietung/?page=presse)
#### Dienstag, 28. Mai 2019 um 22:00 im Jazzclub Karlsruhe`);

    expect(message.markdown).to.include(`### [Konzert 2](http://localhost:1970/vue/konzert/konzert2?page=presse)
#### Mittwoch, 29. Mai 2019 um 22:00 im Jazzclub Karlsruhe`);

    expect(message.markdown).to.include(`### [Konzert 3](http://localhost:1970/vue/konzert/?page=presse)
#### Samstag, 29. Juni 2019 um 22:00 im Jazzclub Karlsruhe`);

    expect(message.markdown, "Konzert 4 braucht keine Presse").to.not.include(`### [Konzert 4]`);
  });
});
