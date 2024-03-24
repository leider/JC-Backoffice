import { describe, expect, it } from "vitest";

import Kalender, { EmailEvent } from "../../programmheft/kalender.js";
import DatumUhrzeit from "../../commons/DatumUhrzeit.js";

describe("Kalender", () => {
  describe("geht korrekt mit id und text um", () => {
    it("initial", () => {
      const kalender = new Kalender();
      expect(kalender.id).to.eql("2018/01");
      expect(kalender.year()).to.eql("2018");
      expect(kalender.text).is.not.undefined;
      expect(kalender.asEvents()).to.eql([]);
    });

    it("parses date correctly", () => {
      const kalender = new Kalender({ id: "2020/12", text: "" });
      expect(kalender.id).to.eql("2020/12");
      expect(kalender.year()).to.eql("2020");
    });

    it("parses broken date correctly", () => {
      const kalender = new Kalender({ id: "Peter/", text: "" });
      expect(kalender.id).to.eql("2018/01");
      expect(kalender.year()).to.eql("2018");
    });

    it("parses empty text correctly", () => {
      const kalender = new Kalender({
        id: "2020/12",
        text: "",
      });
      expect(kalender.text).to.not.eql("");
      expect(kalender.asEvents()).to.eql([]);
    });

    it("parses old style default text correctly", () => {
      const kalender = new Kalender({
        id: "2020/12",
        text: "Was | Wer | Farbe | Wann\n" + "--- | --- | ---   | ---\n",
      });
      expect(kalender.text).to.eql(`Was | Wer | Farbe | Wann
--- | --- | ---   | ---
`);
      expect(kalender.asEvents()).to.eql([]);
    });
  });

  describe("geht korrekt mit datums um", () => {
    it("parses old style filled text correctly", () => {
      const kalender = new Kalender({
        id: "2020/12",
        text: `Was | Wer | Farbe | Wann
Irgendwas | Irgendwer | Green   | 13.12.2020
`,
      });
      expect(kalender.asEvents()).to.eql([
        {
          start: "2020-12-12T23:00:00.000Z",
          end: "2020-12-13T21:00:00.000Z",
          title: "Irgendwas (Irgendwer)",
          farbe: "Green",
        },
      ]);
    });

    it("ohne Jahr - parses old style filled text correctly", () => {
      const kalender = new Kalender({
        id: "2020/12",
        text: `Was | Wer | Farbe | Wann
Irgendwas | Irgendwer | Green   | 13.12.
`,
      });
      expect(kalender.asEvents()).to.eql([
        {
          start: "2020-12-12T23:00:00.000Z",
          end: "2020-12-13T21:00:00.000Z",
          title: "Irgendwas (Irgendwer)",
          farbe: "Green",
        },
      ]);
    });

    it("parses broken date text correctly (e.g. empty)", () => {
      const kalender = new Kalender({
        id: "2020/12",
        text: `Was | Wer | Farbe | Wann
Irgendwas | Irgendwer | Green   | 33.
`,
      });
      expect(kalender.asEvents()).to.eql([]);
    });
  });

  describe("geht korrekt mit Erweiterungen um  (email and mail offset)", () => {
    it("parses new style filled text correctly (email)", () => {
      const kalender = new Kalender({
        id: "2020/12",
        text: `Was | Wer | Farbe | Wann | Email
Irgendwas | Irgendwer | Green   | 13.12.2020 | andreas@andreas.as
`,
      });
      expect(kalender.asEvents()).to.eql([
        {
          start: "2020-12-12T23:00:00.000Z",
          end: "2020-12-13T21:00:00.000Z",
          title: "Irgendwas (Irgendwer)",
          farbe: "Green",
          email: "andreas@andreas.as",
          emailOffset: 7,
          was: "Irgendwas",
          wer: "Irgendwer",
        },
      ]);
    });

    it("parses new style filled text correctly (email und offset)", () => {
      const kalender = new Kalender({
        id: "2020/12",
        text: `Was | Wer | Farbe | Wann | Email | Tage vorher
Irgendwas | Irgendwer | Green   | 13.12.2020 | andreas@andreas.as | 14
`,
      });
      const events = kalender.asEvents();
      expect(events).to.eql([
        {
          start: "2020-12-12T23:00:00.000Z",
          end: "2020-12-13T21:00:00.000Z",
          title: "Irgendwas (Irgendwer)",
          farbe: "Green",
          email: "andreas@andreas.as",
          emailOffset: 14,
          was: "Irgendwas",
          wer: "Irgendwer",
        },
      ]);
      const nov29 = DatumUhrzeit.forGermanStringOrNow("29.11.20", "01:13");
      expect(new EmailEvent(events[0]).shouldSendOn(nov29)).to.be.true;
    });
  });

  describe("findet Events mit E-Mail Adresse", () => {
    const kalender = new Kalender({
      id: "2020/12",
      text: `Was | Anrede | Farbe | Wann | Email | Tage vorher
Irgendwas | Irgendwer | Green   | 11.12.2020 | 
Irgendwas | Irgendwer | Green   | 13.12.2020 | andreas@andreas.as | 14
`,
    });
    const sendeDatum = DatumUhrzeit.forISOString("2020-11-29");

    it("und berücksichtigt den Offset", () => {
      const emailEvents = kalender.eventsToSend(sendeDatum);
      expect(emailEvents).to.have.length(1);

      const emailEvent = emailEvents[0];
      expect(emailEvent.event).to.eql({
        start: "2020-12-12T23:00:00.000Z",
        end: "2020-12-13T21:00:00.000Z",
        title: "Irgendwas (Irgendwer)",
        farbe: "Green",
        email: "andreas@andreas.as",
        emailOffset: 14,
        was: "Irgendwas",
        wer: "Irgendwer",
      });
      expect(emailEvent.email()).to.eql("andreas@andreas.as");
      expect(emailEvent.body()).to.eql(
        `Irgendwer,

hier eine automatische Erinnerungsmail:
Irgendwas

Vielen Dank für Deine Arbeit und Unterstützung,
Damit alles reibungslos klappt, sollte dies bis zum 13. Dezember 2020 erledigt sein.

Danke & keep swingin'`,
      );
    });
  });
});
