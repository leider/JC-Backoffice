/* eslint-disable no-useless-escape*/
import { describe, expect, it } from "vitest";

import Kalender, { EmailEvent } from "../../programmheft/kalender.js";
import DatumUhrzeit from "../../commons/DatumUhrzeit.js";

describe("Kalender", () => {
  describe("geht korrekt mit id und text um", () => {
    it("initial", () => {
      const kalender = new Kalender();
      expect(kalender.id).to.eql("2018/01");
      expect(kalender.year()).to.eql("2018");
      expect(kalender.text).toBeDefined();
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
      expect(kalender.text).to.eql("");
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
          title: "Irgendwas (Irgendwer)",
          farbe: "Green",
        },
      ]);
    });

    it("ohne Jahr - parses old style filled as not existing", () => {
      const kalender = new Kalender({
        id: "2020/12",
        text: `Was | Wer | Farbe | Wann
Irgendwas | Irgendwer | Green   | 13.12.
`,
      });
      expect(kalender.asEvents()).to.eql([]);
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
          title: "Irgendwas (Irgendwer)",
          farbe: "Green",
          email: "andreas@andreas.as",
          emailOffset: 14,
          was: "Irgendwas",
          wer: "Irgendwer",
        },
      ]);
      const nov29 = DatumUhrzeit.forGermanStringOrNow("29.11.20", "01:13");
      expect(new EmailEvent(events[0]).shouldSendOn(nov29)).toBeTruthy();
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
        title: "Irgendwas (Irgendwer)",
        farbe: "Green",
        email: "andreas@andreas.as",
        emailOffset: 14,
        was: "Irgendwas",
        wer: "Irgendwer",
      });
      expect(emailEvent.email()).to.eql(["andreas@andreas.as"]);
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

  describe("cleans backslashes", () => {
    const kalender = new Kalender({
      id: "2020/12",
      text: `|Was|Wer|Farbe|Wann|Email|Tage vorher|
|---|---|---|---|---|---|
|Booking fertig \+ Pressematerial liegt vor|Torsten\, Andreas\, Gernot\, Amelie\, Niklas|DodgerBlue|01\.11\.2024|[booking\@jazzclub\.de](mailto:booking@jazzclub.de) [andreas\.jonczyk\@jazzclub\.de](mailto:andreas.jonczyk@jazzclub.de) [torsten\.antoni\@jazzclub\.de](mailto:torsten.antoni@jazzclub.de) [gernot\.ziegler\@jazzclub\.de](mailto:gernot.ziegler@jazzclub.de) [niklas\.braun\@jazzclub\.de](mailto:niklas.braun@jazzclub.de) [amelie\.stapf\@jazzclub\.de](mailto:amelie.stapf@jazzclub.de)|7|
|Editorial fertig|Teddy|Coral|08\.11\.2024|[christoph\.bohning\@jazzclub\.de](mailto:christoph.bohning@jazzclub.de)|9|
|Editorial fertig|Teddy|Coral|08\.11\.2024|[christoph\.bohning\@jazzclub\.de](mailto:christoph.bohning@jazzclub.de)|3|
|Pressetexte fertig|Johannes|FireBrick|08\.11\.2024|[jotfrisch\@gmx\.de](mailto:jotfrisch@gmx.de)|7|
|Layout starten|Christina|FireBrick|09\.11\.2024|[grafik\@jazzclub\.de](mailto:grafik@jazzclub.de)|6|
|Ticketing|Kai|FireBrick|09\.11\.2024|[kai\.hanneken\@jazzclub\.de](mailto:kai.hanneken@jazzclub.de)|6|
|Korrekturschleife \- Rückgabe in 1 Woche|Alle|blue|14\.11\.2024|[booking\@jazzclub\.de](mailto:booking@jazzclub.de) [andreas\.jonczyk\@jazzclub\.de](mailto:andreas.jonczyk@jazzclub.de) [torsten\.antoni\@jazzclub\.de](mailto:torsten.antoni@jazzclub.de) [gernot\.ziegler\@jazzclub\.de](mailto:gernot.ziegler@jazzclub.de) [niklas\.braun\@jazzclub\.de](mailto:niklas.braun@jazzclub.de) [amelie\.stapf\@jazzclub\.de](mailto:amelie.stapf@jazzclub.de) [Kai\.hanneken\@jazzclub\.de](mailto:Kai.hanneken@jazzclub.de)|3|
|Bitte Mitgliederliste checken|Enrik|YellowGreen|18\.11\.2024|[enrik\.berkhan\@jazzclub\.de](mailto:enrik.berkhan@jazzclub.de)|3|
|Heft u\. Plakate in Druck geben|Christina|Green|25\.11\.2024|[grafik\@jazzclub\.de](mailto:grafik@jazzclub.de)|3|

&nbsp;`,
    });

    it("und berücksichtigt den Offset", () => {
      const emailEvents = kalender.asEvents();
      expect(emailEvents).to.have.length(9);

      const emailEvent = emailEvents[0];
      expect(emailEvent).to.eql({
        email:
          "[booking@jazzclub.de](mailto:booking@jazzclub.de) [andreas.jonczyk@jazzclub.de](mailto:andreas.jonczyk@jazzclub.de) [torsten.antoni@jazzclub.de](mailto:torsten.antoni@jazzclub.de) [gernot.ziegler@jazzclub.de](mailto:gernot.ziegler@jazzclub.de) [niklas.braun@jazzclub.de](mailto:niklas.braun@jazzclub.de) [amelie.stapf@jazzclub.de](mailto:amelie.stapf@jazzclub.de)",
        emailOffset: 7,
        farbe: "DodgerBlue",
        start: "2024-10-31T23:00:00.000Z",
        title: "Booking fertig + Pressematerial liegt vor (Torsten, Andreas, Gernot, Amelie, Niklas)",
        was: "Booking fertig + Pressematerial liegt vor",
        wer: "Torsten, Andreas, Gernot, Amelie, Niklas",
      });
    });
  });
});
