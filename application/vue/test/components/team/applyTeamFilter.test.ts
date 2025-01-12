import { describe, expect, it } from "vitest";
import Konzert from "jc-shared/konzert/konzert";
import applyTeamFilter from "../../../src/components/team/TeamFilter/applyTeamFilter";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import map from "lodash/map";

const neutral = new Konzert({ kopf: { titel: "Neutral" } });
const bestaetigt = new Konzert({ kopf: { titel: "Bestätigt", confirmed: true } });
const cancelled = new Konzert({ kopf: { titel: "Cancelled", abgesagt: true } });
const kannAufHomepage = new Konzert({ kopf: { titel: "KannAufHomepage", kannAufHomePage: true } });
const kannAufSocialMedia = new Konzert({ kopf: { titel: "KannAufSocialMedia", kannInSocialMedia: true } });

const presseOK = new Konzert({ kopf: { titel: "PresseOK" }, presse: { checked: true } });
const keinePresse = new Konzert({ brauchtPresse: false, kopf: { titel: "KeinePresse" }, presse: { checked: true } });
const textVorhanden = new Konzert({ kopf: { titel: "TextVorhanden" }, presse: { text: "Text" } });
const originaltextVorhanden = new Konzert({ kopf: { titel: "OriginaltextVorhanden" }, presse: { originalText: "Text" } });

const fotografEinladen = new Konzert({ kopf: { titel: "FotografEinladen", fotografBestellen: true } });
const technikChecked = new Konzert({ kopf: { titel: "TechnikChecked" }, technik: { checked: true } });
const fluegel = new Konzert({ kopf: { titel: "Fluegel" }, technik: { fluegel: true } });
const hotelBestatigt = new Konzert({
  kopf: { titel: "HotelBestatigt" },
  artist: { brauchtHotel: true },
  unterkunft: { bestaetigt: true },
});
const hotelNichtBestatigt = new Konzert({
  kopf: { titel: "HotelNichtBestatigt" },
  artist: { brauchtHotel: true },
  unterkunft: { bestaetigt: false },
});

const mitEventTyp1 = new Konzert({
  kopf: { titel: "mitEventTyp1", eventTyp: "eventTyp1" },
});

const mitEventTyp2 = new Konzert({
  kopf: { titel: "mitEventTyp2", eventTyp: "eventTyp2" },
});

const alleKonzerte = [
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
  mitEventTyp1,
  mitEventTyp2,
];

function checkResult(filter: (ver: Veranstaltung) => boolean) {
  return map(alleKonzerte.filter(filter), "kopf.titel");
}

function checkInverseResult(filter: (ver: Veranstaltung) => boolean) {
  return map(
    alleKonzerte.filter((k) => !filter(k)),
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
    expect(checkResult(filter)).to.eql(["HotelBestatigt"]);
  });

  it("should return for not Hotel Bestaetigt", () => {
    const filter = applyTeamFilter({ hotelBestaetigt: false });
    expect(checkResult(filter)).to.eql(["HotelNichtBestatigt"]);
  });

  it("should return for eventTyp", () => {
    const filter = applyTeamFilter({ kopf: { eventTyp: ["eventTyp1", "eventTyp2"] } });
    expect(checkResult(filter)).to.eql(["mitEventTyp1", "mitEventTyp2"]);
  });
});
