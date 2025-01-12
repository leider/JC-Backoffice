import { describe, expect, it } from "vitest";
import applyTeamFilter from "../../../src/components/team/TeamFilter/applyTeamFilter";
import Vermietung from "jc-shared/vermietung/vermietung";
import filter from "lodash/filter";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import map from "lodash/map";

const neutral = new Vermietung({ kopf: { titel: "Neutral" } });
const bestaetigt = new Vermietung({ kopf: { titel: "Bestätigt", confirmed: true } });
const cancelled = new Vermietung({ kopf: { titel: "Cancelled", abgesagt: true } });
const kannAufHomepage = new Vermietung({ kopf: { titel: "KannAufHomepage", kannAufHomePage: true } });
const kannAufSocialMedia = new Vermietung({ kopf: { titel: "KannAufSocialMedia", kannInSocialMedia: true } });

const presseOK = new Vermietung({ kopf: { titel: "PresseOK" }, presse: { checked: true } });
const keinePresse = new Vermietung({ brauchtPresse: false, kopf: { titel: "KeinePresse" }, presse: { checked: true } });
const textVorhanden = new Vermietung({ kopf: { titel: "TextVorhanden" }, presse: { text: "Text" } });
const originaltextVorhanden = new Vermietung({ kopf: { titel: "OriginaltextVorhanden" }, presse: { originalText: "Text" } });

const fotografEinladen = new Vermietung({ kopf: { titel: "FotografEinladen", fotografBestellen: true } });
const technikChecked = new Vermietung({ kopf: { titel: "TechnikChecked" }, technik: { checked: true } });
const fluegel = new Vermietung({ kopf: { titel: "Fluegel" }, technik: { fluegel: true } });
const hotelBestatigt = new Vermietung({
  kopf: { titel: "HotelBestatigt" },
  artist: { brauchtHotel: true },
});
const hotelNichtBestatigt = new Vermietung({
  kopf: { titel: "HotelNichtBestatigt" },
  artist: { brauchtHotel: true },
});

const alleVermietungen = [
  neutral,
  bestaetigt,
  cancelled,
  kannAufHomepage,
  kannAufSocialMedia,
  presseOK,
  keinePresse,
  textVorhanden,
  originaltextVorhanden,
  fotografEinladen,
  technikChecked,
  fluegel,
  hotelBestatigt,
  hotelNichtBestatigt,
];

function checkResult(filt: (ver: Veranstaltung) => boolean) {
  return map(filter(alleVermietungen, filt), "kopf.titel");
}

function checkInverseResult(filt: (ver: Veranstaltung) => boolean) {
  return map(
    filter(alleVermietungen, (k) => !filt(k)),
    "kopf.titel",
  );
}

describe("applyTeamFilter", () => {
  it("should return true when filter is empty", () => {
    const filter = applyTeamFilter({});
    expect(checkInverseResult(filter)).to.eql([]);
  });

  it("should return for Bestätigt", () => {
    const filter = applyTeamFilter({ kopf: { confirmed: true } });
    expect(checkResult(filter)).to.eql(["Bestätigt"]);
  });

  it("should return for Nicht Bestätigt", () => {
    const filter = applyTeamFilter({ kopf: { confirmed: false } });
    expect(checkInverseResult(filter)).to.eql(["Bestätigt"]);
  });

  it("should return for Abgesagt", () => {
    const filter = applyTeamFilter({ kopf: { abgesagt: true } });
    expect(checkResult(filter)).to.eql(["Cancelled"]);
  });

  it("should return for Nicht Abgesagt", () => {
    const filter = applyTeamFilter({ kopf: { abgesagt: false } });
    expect(checkInverseResult(filter)).to.eql(["Cancelled"]);
  });

  it("should return for PresseOK", () => {
    const filter = applyTeamFilter({ presse: { checked: true } });
    expect(checkResult(filter)).to.eql(["PresseOK"]);
  });

  it("should return for not PresseOK", () => {
    const filter = applyTeamFilter({ presse: { checked: false } });
    expect(checkInverseResult(filter)).to.eql(["PresseOK", "KeinePresse"]);
  });

  it("should return for Kann Homepage", () => {
    const filter = applyTeamFilter({ kopf: { kannAufHomePage: true } });
    expect(checkResult(filter)).to.eql(["KannAufHomepage"]);
  });

  it("should return for not Kann Homepage", () => {
    const filter = applyTeamFilter({ kopf: { kannAufHomePage: false } });
    expect(checkInverseResult(filter)).to.eql(["KannAufHomepage"]);
  });

  it("should return for Kann Social", () => {
    const filter = applyTeamFilter({ kopf: { kannInSocialMedia: true } });
    expect(checkResult(filter)).to.eql(["KannAufSocialMedia"]);
  });

  it("should return for not Kann Social", () => {
    const filter = applyTeamFilter({ kopf: { kannInSocialMedia: false } });
    expect(checkInverseResult(filter)).to.eql(["KannAufSocialMedia"]);
  });

  it("should return for Text vorhanden", () => {
    const filter = applyTeamFilter({ presse: { text: true } });
    expect(checkResult(filter)).to.eql(["TextVorhanden"]);
  });

  it("should return for not Text vorhanden", () => {
    const filter = applyTeamFilter({ presse: { text: false } });
    expect(checkInverseResult(filter)).to.eql(["KeinePresse", "TextVorhanden"]);
  });

  it("should return for Originaltext vorhanden", () => {
    const filter = applyTeamFilter({ presse: { originalText: true } });
    expect(checkResult(filter)).to.eql(["OriginaltextVorhanden"]);
  });

  it("should return for not Originaltext vorhanden", () => {
    const filter = applyTeamFilter({ presse: { originalText: false } });
    expect(checkInverseResult(filter)).to.eql(["KeinePresse", "OriginaltextVorhanden"]);
  });

  it("should return for Fotograf", () => {
    const filter = applyTeamFilter({ kopf: { fotografBestellen: true } });
    expect(checkResult(filter)).to.eql(["FotografEinladen"]);
  });

  it("should return for not Fotograf", () => {
    const filter = applyTeamFilter({ kopf: { fotografBestellen: false } });
    expect(checkInverseResult(filter)).to.eql(["FotografEinladen"]);
  });

  it("should return for Technik", () => {
    const filter = applyTeamFilter({ technik: { checked: true } });
    expect(checkResult(filter)).to.eql(["TechnikChecked"]);
  });

  it("should return for not Technik", () => {
    const filter = applyTeamFilter({ technik: { checked: false } });
    expect(checkInverseResult(filter)).to.eql(["TechnikChecked"]);
  });

  it("should return for Flügel", () => {
    const filter = applyTeamFilter({ technik: { fluegel: true } });
    expect(checkResult(filter)).to.eql(["Fluegel"]);
  });

  it("should return for not Flügel", () => {
    const filter = applyTeamFilter({ technik: { fluegel: false } });
    expect(checkInverseResult(filter)).to.eql(["Fluegel"]);
  });

  it("should return for Hotel Bestaetigt", () => {
    const filter = applyTeamFilter({ hotelBestaetigt: true });
    expect(checkResult(filter)).to.eql([]);
  });

  it("should return for not Hotel Bestaetigt", () => {
    const filter = applyTeamFilter({ hotelBestaetigt: false });
    expect(checkResult(filter)).to.eql([]);
  });
});
