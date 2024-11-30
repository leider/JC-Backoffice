import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as sin from "sinon";
import "../initWinstonForTest";
import "jc-backend/configure.js";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import userstore from "jc-backend/lib/users/userstore.js";
import kalenderstore from "jc-backend/lib/programmheft/kalenderstore.js";
import Kalender from "jc-shared/programmheft/kalender.js";
import { Event } from "jc-shared/programmheft/Event.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import { EmailEvent, remindForProgrammheft } from "../../src/sendMailsForProgrammheft.js";
import User from "jc-shared/user/user.js";

const sinon = sin.createSandbox();

describe("Programmheft Mailsender", () => {
  const april12 = DatumUhrzeit.forGermanString("12.04.2019");
  const april13 = DatumUhrzeit.forGermanString("13.04.2019");
  const april15Text = DatumUhrzeit.forGermanString("15.04.2019")!.toISOString;
  const june15Text = DatumUhrzeit.forGermanString("15.06.2019")!.toISOString;

  const allUsers = [
    new User({ id: "xyz", name: "X Y Z", email: "x@y.z" }),
    new User({ id: "abc", name: "A B C", email: "a@b.c" }),
    new User({ id: "lmn", name: "L M N", email: "l@m.n" }),
  ];

  const currentKalender = new Kalender({
    id: "2019/05",
    events: [new Event({ start: april15Text, was: "Putzen", users: ["abc", "lmn", "xyz"], farbe: "#9ACD32", emailOffset: 3 })],
  });
  const nextKalender = new Kalender({
    id: "2019/07",
    events: [new Event({ start: june15Text, was: "Putzen", users: ["xyz"], farbe: "#9ACD32", emailOffset: 3 })],
  });

  let mailcheck: sin.SinonStub;

  beforeEach(() => {
    sinon.stub(kalenderstore, "getCurrentKalender").returns(currentKalender);
    sinon.stub(kalenderstore, "getNextKalender").returns(nextKalender);
    sinon.stub(userstore, "allUsers").returns(allUsers);
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
    expect(message.body).to.include(`Hallo X Y Z, A B C, L M N,

hier eine automatische Erinnerungsmail:
Putzen

Vielen Dank für Deine Arbeit und Unterstützung,
Damit alles reibungslos klappt, sollte dies bis zum 15. April 2019 erledigt sein.

Danke & keep swingin'`);

    expect(message.body).to.include("bis zum 15. April 2019 erledigt");

    expect(message.subject).to.equal("Programmheft Action Reminder");
  });

  it("runs correctly on a day where no notificatons lie", async () => {
    await remindForProgrammheft(april13 as DatumUhrzeit);
    sinon.assert.notCalled(mailcheck);
  });

  it("handles events with users correctly", () => {
    const allUsers = [new User({ id: "jott", name: "Andreas", email: "andreas@andreas.new" })];
    const event = new Event({
      users: ["jott"],
      start: "2020-12-12T23:00:00.000Z",
      farbe: "Green",
      emailOffset: 14,
      was: "Irgendwas",
    });

    const emailEvent = new EmailEvent(event);

    expect(emailEvent.email(allUsers)).to.eql(["andreas@andreas.new"]);
    expect(emailEvent.body(allUsers)).to.eql(
      `Hallo Andreas,

hier eine automatische Erinnerungsmail:
Irgendwas

Vielen Dank für Deine Arbeit und Unterstützung,
Damit alles reibungslos klappt, sollte dies bis zum 13. Dezember 2020 erledigt sein.

Danke & keep swingin'`,
    );
  });
});
