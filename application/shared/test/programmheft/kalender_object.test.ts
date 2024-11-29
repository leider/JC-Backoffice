import { describe, expect, it } from "vitest";

import Kalender from "../../programmheft/kalender.js";
import { Event } from "../../programmheft/Event.js";

describe("Kalender", () => {
  describe("geht korrekt mit id um", () => {
    it("initial", () => {
      const kalender = new Kalender();
      expect(kalender.id).to.eql("2018/01");
      expect(kalender.year()).to.eql("2018");
      expect(kalender.events).to.eql([]);
    });

    it("parses date correctly", () => {
      const kalender = new Kalender({ id: "2020/12" });
      expect(kalender.id).to.eql("2020/12");
      expect(kalender.year()).to.eql("2020");
    });

    it("parses broken date correctly", () => {
      const kalender = new Kalender({ id: "Peter/" });
      expect(kalender.id).to.eql("2018/01");
      expect(kalender.year()).to.eql("2018");
    });
  });

  describe("Events", () => {
    it("displays title correctly", () => {
      const kalender = new Kalender({
        id: "2020/12",
        events: [{ start: "2020-12-12T23:00:00.000Z", users: ["irgendwer"], was: "Irgendwas", farbe: "#9ACD32" }],
      });
      const event = kalender.events[0];
      expect(event.start).to.eql("2020-12-12T23:00:00.000Z");
      expect(event.title).to.eql("Irgendwas (Irgendwer)");
      expect(event.farbe).to.eql("#9ACD32");
    });

    it("verschiebt und sortiert events korrekt zur Basis ID", () => {
      const kalender = new Kalender({
        id: "2021/01",
        events: [
          new Event({ start: "2020-12-12T23:00:00+01:00", farbe: "" }),
          new Event({ start: "2020-12-01T23:00:00+01:00", farbe: "" }),
        ],
      });
      const movedEvents = kalender.eventsMovedWithBase("2022/03");
      expect(movedEvents[0].start).to.eql("2022-02-01T23:00:00+01:00");
      expect(movedEvents[1].start).to.eql("2022-02-12T23:00:00+01:00");
    });

    it("verschiebt und sortiert events korrekt tagesweise", () => {
      const event = new Event({ start: "2020-12-12T23:00:00+01:00", farbe: "" }).cloneAndMoveBy({ tage: 1 });
      expect(event.start).to.eql("2020-12-13T23:00:00+01:00");
    });
  });
});
