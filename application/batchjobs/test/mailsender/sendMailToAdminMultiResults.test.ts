import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as sin from "sinon";
import "../initWinstonForTest";
import "jc-backend/configure.js";

import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import { informAdmin } from "../../src/sendMailToAdmin.js";
import userstore from "jc-backend/lib/users/userstore.js";
import User from "jc-shared/user/user.js";
import { sentMessageInfo } from "./testObjects.js";

const sinon = sin.createSandbox();

describe("Admin Report Mail", () => {
  let mailcheck: sin.SinonStub;

  beforeEach(() => {
    sinon.stub(userstore, "forId").returns(new User({ id: "leider", email: "admin@mail.check", name: "Admin" }));
    mailcheck = sinon.stub(mailtransport, "sendMail").resolves(undefined);
  });

  afterEach(() => {
    sinon.restore();
  });

  it("no jobResult information, not mail", async () => {
    await informAdmin([
      { type: "Bar", jobResult: {} },
      { type: "Fluegel", jobResult: {} },
    ]);
    sinon.assert.notCalled(mailcheck);
  });

  it("result information, no mail", async () => {
    await informAdmin([]);
    sinon.assert.notCalled(mailcheck);
  });

  it("successful will send info mail", async () => {
    await informAdmin([
      { type: "Bar", jobResult: { result: sentMessageInfo } },
      { type: "Fluegel", jobResult: { result: sentMessageInfo } },
    ]);
    sinon.assert.calledOnce(mailcheck);
    const message = mailcheck.args[0][0];
    expect(message.subject).to.equal("[INFO B-O Jazzclub] Mails sent");
    expect(message.to).to.eql([{ address: "admin@mail.check", name: "Admin" }]);
    expect(message.body).to.include("**Bar** 1 Mail(s)");
    expect(message.body).to.include("**Fluegel** 1 Mail(s)");
    expect(message.body).to.include(`[
  {
    "accepted": [
      "success@mail"
    ],
    "rejected": [],
    "response": "some response information"
  }
]`);
  });

  it("error will send error mail if one of the results has error", async () => {
    await informAdmin([
      { type: "Bar", jobResult: { error: new Error("alles kaputt") } },
      { type: "Fluegel", jobResult: { result: sentMessageInfo } },
    ]);
    sinon.assert.calledOnce(mailcheck);
    const message = mailcheck.args[0][0];
    expect(message.subject).to.equal("[ERROR B-O Jazzclub] Mails sent");
    expect(message.to).to.eql([{ address: "admin@mail.check", name: "Admin" }]);
    expect(message.body).to.include("**Bar** 0 Mail(s)");
    expect(message.body).to.include(`### Es gibt Fehler!
Error: alles kaputt`);
    expect(message.body).to.include("**Fluegel** 1 Mail(s)");
    expect(message.body).to.include(`[
  {
    "accepted": [
      "success@mail"
    ],
    "rejected": [],
    "response": "some response information"
  }
]`);
  });
});
