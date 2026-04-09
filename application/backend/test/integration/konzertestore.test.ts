import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../initWinstonForTest.js";
import "../../configure.js";

import konzertestore from "../../lib/konzerte/konzertestore.js";
import optionenstore from "../../lib/optionen/optionenstore.js";
import { db } from "../../lib/persistence/sqlitePersistence.js";
import Konzert from "jc-shared/konzert/konzert.js";
import OptionValues from "jc-shared/optionen/optionValues.js";
import User from "jc-shared/user/user.js";

const testUser = new User({ id: "test-admin", name: "Test Admin", gruppen: "superusers" });
const testId = "integration-test-konzert";

function cleanup() {
  db.exec(`DELETE FROM veranstaltungenstore WHERE id LIKE 'integration-test-%'`);
  db.exec(`DELETE FROM veranstaltungenstorehistory WHERE id LIKE 'integration-test-%'`);
}

describe("konzertestore – save/load round-trip", () => {
  beforeEach(() => {
    cleanup();
    optionenstore.save(
      new OptionValues({
        id: "instance",
        typenPlus: [
          {
            name: "Club Konzert",
            color: "#4faee3",
            mod: true,
            kasseV: true,
            kasse: false,
            technikerV: true,
            techniker: true,
            merchandise: false,
          },
        ] as unknown as OptionValues["typenPlus"],
      }),
      testUser,
    );
  });

  afterEach(cleanup);

  it("preserves all kopf fields through save and load", () => {
    const konzert = new Konzert({
      id: testId,
      url: testId,
      startDate: "2020-03-20T17:30:00.000Z",
      endDate: "2020-03-20T19:00:00.000Z",
      kopf: {
        titel: "Round Trip",
        eventTyp: "Club Konzert",
        ort: "Jazzclub",
        pressename: "Jazzclub Karlsruhe",
        presseIn: "im Jazzclub Karlsruhe",
        flaeche: 100,
        kooperation: "TestKoop",
        beschreibung: "TestBeschreibung",
        genre: "Jazz",
        confirmed: false,
        rechnungAnKooperation: false,
        abgesagt: false,
        fotografBestellen: false,
        kannAufHomePage: false,
        kannInSocialMedia: false,
      },
    });

    konzertestore.saveKonzert(konzert, testUser);
    const loaded = konzertestore.getKonzert(testId);

    expect(loaded).not.toBeNull();
    expect(loaded!.kopf.titel).toBe("Round Trip");
    expect(loaded!.kopf.eventTyp).toBe("Club Konzert");
    expect(loaded!.kopf.ort).toBe("Jazzclub");
    expect(loaded!.kopf.kooperation).toBe("TestKoop");
    expect(loaded!.kopf.beschreibung).toBe("TestBeschreibung");
    expect(loaded!.kopf.genre).toBe("Jazz");
    expect(loaded!.kopf.flaeche).toBe(100);
    expect(new Date(loaded!.startDate).toISOString()).toBe("2020-03-20T17:30:00.000Z");
    expect(new Date(loaded!.endDate).toISOString()).toBe("2020-03-20T19:00:00.000Z");
  });

  it("enriches eventTypRich from optionenstore on save", () => {
    const konzert = new Konzert({
      id: testId,
      url: testId,
      startDate: "2020-03-20T17:30:00.000Z",
      endDate: "2020-03-20T19:00:00.000Z",
      kopf: { titel: "EventTypRich Test", eventTyp: "Club Konzert", ort: "Jazzclub" },
    });

    konzertestore.saveKonzert(konzert, testUser);
    const loaded = konzertestore.getKonzert(testId);

    expect(loaded).not.toBeNull();
    expect(loaded!.kopf.eventTypRich).toBeDefined();
    expect(loaded!.kopf.eventTypRich!.name).toBe("Club Konzert");
    expect(loaded!.kopf.eventTypRich!.color).toBe("#4faee3");
  });

  it("preserves gaesteliste and reservierungen", () => {
    const konzert = new Konzert({
      id: testId,
      url: testId,
      startDate: "2020-03-20T17:30:00.000Z",
      endDate: "2020-03-20T19:00:00.000Z",
      kopf: { titel: "Gäste Test", eventTyp: "Club Konzert" },
      gaesteliste: [{ name: "Stefan Rinderle", comment: "VIP", number: 2, alreadyIn: 0 }],
      reservierungen: [{ name: "Mario Rinderle", comment: "Freund", number: 4, alreadyIn: 1 }],
    });

    konzertestore.saveKonzert(konzert, testUser);
    const loaded = konzertestore.getKonzert(testId);

    expect(loaded!.gaesteliste).toHaveLength(1);
    expect(loaded!.gaesteliste[0]).toEqual({ name: "Stefan Rinderle", comment: "VIP", number: 2, alreadyIn: 0 });
    expect(loaded!.reservierungen).toHaveLength(1);
    expect(loaded!.reservierungen[0]).toEqual({ name: "Mario Rinderle", comment: "Freund", number: 4, alreadyIn: 1 });
  });

  it("writes a history entry on save", () => {
    const konzert = new Konzert({
      id: testId,
      url: testId,
      startDate: "2020-03-20T17:30:00.000Z",
      endDate: "2020-03-20T19:00:00.000Z",
      kopf: { titel: "History Test", eventTyp: "Club Konzert" },
    });

    konzertestore.saveKonzert(konzert, testUser);

    const history = db.prepare("SELECT * FROM veranstaltungenstorehistory WHERE id = ?").all(testId);
    expect(history.length).toBeGreaterThan(0);
  });

  it("returns null after delete", () => {
    const konzert = new Konzert({
      id: testId,
      url: testId,
      startDate: "2020-03-20T17:30:00.000Z",
      endDate: "2020-03-20T19:00:00.000Z",
      kopf: { titel: "Delete Test", eventTyp: "Club Konzert" },
    });

    konzertestore.saveKonzert(konzert, testUser);
    expect(konzertestore.getKonzert(testId)).not.toBeNull();

    konzertestore.deleteKonzertById(testId, testUser);
    expect(konzertestore.getKonzert(testId)).toBeNull();
  });
});
