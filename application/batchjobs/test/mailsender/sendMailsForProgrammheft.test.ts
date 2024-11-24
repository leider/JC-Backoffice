import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as sin from "sinon";
import "../initWinstonForTest";
import "jc-backend/configure.js";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import kalenderstore from "jc-backend/lib/programmheft/kalenderstore.js";
import Kalender from "jc-shared/programmheft/kalender.js";
import { Event } from "jc-shared/programmheft/Event.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import { EmailEvent, eventsToSend, remindForProgrammheft } from "../../src/sendMailsForProgrammheft.js";
import User from "jc-shared/user/user";

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

  describe("kalender creates correct content for sending (old Kalender Format)", () => {
    const kalender = new Kalender({
      id: "2020/12",
      text: `Was | Anrede | Farbe | Wann | Email | Tage vorher
Irgendwas | Irgendwer | Green   | 11.12.2020 | 
Irgendwas | Irgendwer | Green   | 13.12.2020 | andreas@andreas.as | 14
`,
    });
    const sendeDatum = DatumUhrzeit.forISOString("2020-11-29");

    it("und berücksichtigt den Offset", () => {
      const emailEvents = eventsToSend(sendeDatum, kalender.events);
      expect(emailEvents).to.have.length(1);

      const emailEvent = emailEvents[0];
      expect(emailEvent.event).to.eql({
        start: "2020-12-12T23:00:00.000Z",
        farbe: "Green",
        users: [],
        email: "andreas@andreas.as",
        emailOffset: 14,
        was: "Irgendwas",
        wer: "Irgendwer",
      });
      expect(emailEvent.email()).to.eql(["andreas@andreas.as"]);
      expect(emailEvent.body()).to.eql(
        `Hallo Irgendwer,

hier eine automatische Erinnerungsmail:
Irgendwas

Vielen Dank für Deine Arbeit und Unterstützung,
Damit alles reibungslos klappt, sollte dies bis zum 13. Dezember 2020 erledigt sein.

Danke & keep swingin'`,
      );
    });

    it("parses new style filled text correctly (email und offset)", () => {
      const event = kalender.events[1];
      expect(event.start).to.eql("2020-12-12T23:00:00.000Z");
      expect(event.title).to.eql("Irgendwas (Irgendwer)");
      expect(event.farbe).to.eql("Green");
      expect(event.email).to.eql("andreas@andreas.as");
      expect(event.emailOffset).to.eql(14);

      const nov29 = DatumUhrzeit.forGermanStringOrNow("29.11.20", "01:13");
      expect(new EmailEvent(event).shouldSendOn(nov29)).toBeTruthy();
    });
  });

  describe("kalender creates correct content for sending (new Kalender Format)", () => {
    const events = [
      { users: [], start: "2020-12-10T23:00:00.000Z", farbe: "Green", email: "", emailOffset: 7, was: "Irgendwas", wer: "Irgendwer" },
      {
        users: [],
        start: "2020-12-12T23:00:00.000Z",
        farbe: "Green",
        email: "andreas@andreas.as",
        emailOffset: 14,
        was: "Irgendwas",
        wer: "Irgendwer",
      },
    ];
    const kalender = new Kalender({
      id: "2020/12",
      text: "",
      events,
    });
    const sendeDatum = DatumUhrzeit.forISOString("2020-11-29");

    it("und berücksichtigt den Offset", () => {
      const emailEvents = eventsToSend(sendeDatum, kalender.events);
      expect(emailEvents).to.have.length(1);

      const emailEvent = emailEvents[0];
      expect(emailEvent.event).to.eql({
        start: "2020-12-12T23:00:00.000Z",
        farbe: "Green",
        users: [],
        email: "andreas@andreas.as",
        emailOffset: 14,
        was: "Irgendwas",
        wer: "Irgendwer",
      });
      expect(emailEvent.email()).to.eql(["andreas@andreas.as"]);
      expect(emailEvent.body()).to.eql(
        `Hallo Irgendwer,

hier eine automatische Erinnerungsmail:
Irgendwas

Vielen Dank für Deine Arbeit und Unterstützung,
Damit alles reibungslos klappt, sollte dies bis zum 13. Dezember 2020 erledigt sein.

Danke & keep swingin'`,
      );
    });
  });

  it("handles events with users correctly", () => {
    const allUsers = [new User({ id: "jott", name: "Andreas", email: "andreas@andreas.new" })];
    const event = new Event({
      users: ["jott"],
      start: "2020-12-12T23:00:00.000Z",
      farbe: "Green",
      email: "andreas@andreas.as",
      emailOffset: 14,
      was: "Irgendwas",
      wer: "Irgendwer",
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
