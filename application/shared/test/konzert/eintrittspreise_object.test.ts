import { describe, expect, it } from "vitest";
import Eintrittspreise from "../../konzert/eintrittspreise.js";

describe("Eintrittspreise", () => {
  const freierEintritt = {
    erwarteteBesucher: 0,
    preisprofil: { name: "Freier Eintritt", rabattErmaessigt: 0, rabattMitglied: 0, regulaer: 0 },
    zuschuss: 0,
  };
  describe("Initialisiert", () => {
    it("mit freiem Eintritt für leeres Objekt", () => {
      const preise = new Eintrittspreise({});
      expect(preise.toJSON()).to.eql(freierEintritt);
    });
    it("mit freiem Eintritt für 'undefined'", () => {
      const preise = new Eintrittspreise();
      expect(preise.toJSON()).to.eql(freierEintritt);
    });
  });

  describe("kommt mit altem Datenformat klar, setzt immer Zuschuss und Besucher", () => {
    it("fuer freien Eintritt", () => {
      const alterDatensatz = { frei: true, zuschuss: null, erwarteteBesucher: NaN };
      const preise = new Eintrittspreise(alterDatensatz);
      expect(preise.toJSON()).to.eql(freierEintritt);
      expect(preise.toJSON().zuschuss).to.eql(0);
      expect(preise.toJSON().erwarteteBesucher).to.eql(0);
    });

    it("fuer freien Eintritt mit gesetzten Rabatten", () => {
      const alterDatensatz = { frei: true, regulaer: 0, rabattErmaessigt: 2, rabattMitglied: 5, erwarteteBesucher: 0 };
      const preise = new Eintrittspreise(alterDatensatz);
      expect(preise.toJSON()).to.eql(freierEintritt);
    });

    it("nimmt alte Preise in neues custom Profil", () => {
      const alterDatensatz = { regulaer: 10, rabattErmaessigt: 2, rabattMitglied: 5, erwarteteBesucher: 50, zuschuss: 10 };
      const preise = new Eintrittspreise(alterDatensatz);
      expect(preise.toJSON().preisprofil).to.eql({ name: "Individuell (Alt)", rabattErmaessigt: 2, rabattMitglied: 5, regulaer: 10 });
      expect(preise.toJSON().zuschuss).to.eql(10);
      expect(preise.toJSON().erwarteteBesucher).to.eql(50);
    });
  });

  describe("kommt mit neuem Datenformat klar", () => {
    it("fuer freien Eintritt", () => {
      const alterDatensatz = { frei: true };
      const preise = new Eintrittspreise(alterDatensatz);
      expect(preise.toJSON()).to.eql(freierEintritt);
    });

    it("nimmt alte Preise in neues custom Profil", () => {
      const p = { preisprofil: { name: "18,00", regulaer: 18, rabattErmaessigt: 2, rabattMitglied: 5 } };
      const preise = new Eintrittspreise(p);
      expect(preise.toJSON().preisprofil).to.eql({ name: "18,00", regulaer: 18, rabattErmaessigt: 2, rabattMitglied: 5 });
    });
  });
});
