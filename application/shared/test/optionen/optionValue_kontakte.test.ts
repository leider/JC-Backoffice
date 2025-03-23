import { describe, expect, it } from "vitest";
import OptionValues from "../../optionen/optionValues.js";
import Kontakt from "../../veranstaltung/kontakt.js";

describe("Agenturen in Optionen", () => {
  it("is properly initialized", () => {
    const emptyOptionen = new OptionValues();
    expect(emptyOptionen).to.eql({
      agenturen: [],
      artists: [],
      backlineJazzclub: [],
      backlineRockshop: [],
      genres: [],
      hotelpreise: [],
      hotels: [],
      id: "instance",
      kooperationen: [],
      preisKlavierstimmer: 125,
      preisprofile: [],
      typenPlus: [],
    });
  });

  describe("addOrUpdateKontakt", () => {
    it("adds Agentur if name is set", () => {
      const emptyOptionen = new OptionValues();
      const kontakt = new Kontakt({ name: "Name" });
      emptyOptionen.addOrUpdateKontakt("agenturen", kontakt);
      expect(emptyOptionen.agenturen).to.eql([{ adresse: "", ansprechpartner: "", email: "", name: "Name", telefon: "" }]);
    });

    it("changes existing Agentur if name is set", () => {
      const optionenWithAgentur = new OptionValues({ agenturen: [new Kontakt({ name: "Name" })] });
      expect(optionenWithAgentur.agenturen).toHaveLength(1);
      const kontakt = new Kontakt({ name: "Name", telefon: "123" });
      optionenWithAgentur.addOrUpdateKontakt("agenturen", kontakt);
      expect(optionenWithAgentur.agenturen).to.eql([{ adresse: "", ansprechpartner: "", email: "", name: "Name", telefon: "123" }]);
    });

    it("adds second Agentur if name is not yet in", () => {
      const optionenWithAgentur = new OptionValues({ agenturen: [new Kontakt({ name: "Name" })] });
      expect(optionenWithAgentur.agenturen).toHaveLength(1);
      const kontakt = new Kontakt({ name: "Name2" });
      optionenWithAgentur.addOrUpdateKontakt("agenturen", kontakt);
      expect(optionenWithAgentur.agenturen).to.eql([
        { adresse: "", ansprechpartner: "", email: "", name: "Name", telefon: "" },
        { adresse: "", ansprechpartner: "", email: "", name: "Name2", telefon: "" },
      ]);
    });

    it("does not add an Agentur without name", () => {
      const emptyOptionen = new OptionValues();
      const kontakt = new Kontakt({ name: "" });
      emptyOptionen.addOrUpdateKontakt("agenturen", kontakt);
      expect(emptyOptionen.agenturen).to.be.empty;
    });

    it('does not add an Agentur if "[temporär]"', () => {
      const emptyOptionen = new OptionValues();
      const kontakt = new Kontakt({ name: "Name" });
      emptyOptionen.addOrUpdateKontakt("agenturen", kontakt, "[temporär]");
      expect(emptyOptionen.agenturen).to.be.empty;
    });
  });
});
