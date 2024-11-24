import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as sin from "sinon";
import "../initWinstonForTest";
import "jc-backend/configure.js";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import kalenderstore from "jc-backend/lib/programmheft/kalenderstore.js";
import Kalender from "jc-shared/programmheft/kalender.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import { remindForProgrammheft } from "../../src/sendMailsForProgrammheft.js";

const sinon = sin.createSandbox();

describe("Programmheft Mailsender", () => {
  const april12 = DatumUhrzeit.forGermanString("12.04.2019");
  const april13 = DatumUhrzeit.forGermanString("13.04.2019");

  const currentKalender = new Kalender({
    id: "2019/05",
    text: "Was | Wer | Farbe | Wann | Email | Tage vorher\n" + "Putzen | Jeder | green | 15.04.19 | x@y.z a@b.c , l@m.n| 3",
  });
  const nextKalender = new Kalender({
    id: "2019/07",
    text: "Was | Wer | Farbe | Wann | Email | Tage vorher\n" + "Putzen | Jeder | green | 15.06.19 | x@y.z | 3",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mailcheck: any;

  beforeEach(() => {
    sinon.stub(kalenderstore, "getCurrentKalender").returns(currentKalender);
    sinon.stub(kalenderstore, "getNextKalender").returns(nextKalender);
    mailcheck = sinon.stub(mailtransport, "sendMail").resolves(undefined);
  });

  afterEach(() => {
    sinon.restore();
  });

  it("runs correctly on a day where notifications lie", async () => {
    await remindForProgrammheft(april12 as DatumUhrzeit);
    sinon.assert.calledOnce(mailcheck);
    const message = mailcheck.args[0][0];
    expect(message.to).to.eql([
      { address: "x@y.z", name: "" },
      { address: "a@b.c", name: "" },
      { address: "l@m.n", name: "" },
    ]);
    expect(message.body).to.include(`Jeder,

hier eine automatische Erinnerungsmail:
Putzen`);

    expect(message.body).to.include("bis zum 15. April 2019 erledigt");

    expect(message.subject).to.equal("Programmheft Action Reminder");
  });

  it("runs correctly on a day where no notificatons lie", async () => {
    await remindForProgrammheft(april13 as DatumUhrzeit);
    sinon.assert.notCalled(mailcheck);
  });
});
