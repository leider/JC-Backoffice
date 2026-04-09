import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../initWinstonForTest.js";
import "../../configure.js";

import store from "../../lib/vermietungen/vermietungenstore.js";
import { db } from "../../lib/persistence/sqlitePersistence.js";
import Vermietung from "jc-shared/vermietung/vermietung.js";
import User from "jc-shared/user/user.js";

const testUser = new User({ id: "test-admin", name: "Test Admin", gruppen: "superusers" });
const testId = "integration-test-vermietung";

function cleanup() {
  db.exec(`DELETE FROM vermietungenstore WHERE id LIKE 'integration-test-%'`);
  db.exec(`DELETE FROM vermietungenstorehistory WHERE id LIKE 'integration-test-%'`);
}

describe("vermietungenstore – save/load round-trip", () => {
  beforeEach(cleanup);
  afterEach(cleanup);

  it("preserves all fields through save and load", () => {
    const vermietung = new Vermietung({
      id: testId,
      url: testId,
      startDate: "2020-03-20T17:30:00.000Z",
      endDate: "2020-03-20T19:00:00.000Z",
      kopf: {
        titel: "Vermietung Round Trip",
        ort: "Jazzclub",
        pressename: "Jazzclub Karlsruhe",
        presseIn: "im Jazzclub Karlsruhe",
        flaeche: 100,
        confirmed: false,
        abgesagt: false,
      },
      spipiMiete: 200,
    });

    store.saveVermietung(vermietung, testUser);
    const loaded = store.getVermietung(testId);

    expect(loaded).not.toBeNull();
    expect(loaded!.kopf.titel).toBe("Vermietung Round Trip");
    expect(loaded!.kopf.ort).toBe("Jazzclub");
    expect(loaded!.kopf.flaeche).toBe(100);
    expect(new Date(loaded!.startDate).toISOString()).toBe("2020-03-20T17:30:00.000Z");
    expect(new Date(loaded!.endDate).toISOString()).toBe("2020-03-20T19:00:00.000Z");
  });

  it("returns null after delete", () => {
    const vermietung = new Vermietung({
      id: testId,
      url: testId,
      startDate: "2020-03-20T17:30:00.000Z",
      endDate: "2020-03-20T19:00:00.000Z",
      kopf: { titel: "Delete Test" },
    });

    store.saveVermietung(vermietung, testUser);
    expect(store.getVermietung(testId)).not.toBeNull();

    store.deleteVermietungById(testId, testUser);
    expect(store.getVermietung(testId)).toBeNull();
  });
});
