import { expect } from "chai";
import Veranstaltung from "../../lib/veranstaltungen/object/veranstaltung";
import { Sprache, Vertragsart } from "../../lib/veranstaltungen/object/vertrag";

const demo = {
  id: "Peterchen",
  startDate: new Date(),
  endDate: new Date(),
  url: "",
  agentur: {
    auswahl: "",
    name: "",
    ansprechpartner: "",
    telefon: "",
    email: "",
    adresse: "",
  },
  artist: {
    bandname: "",
    name: [],
    numMusiker: 1,
    numCrew: 0,
    isBawue: false,
    isAusland: false,
    brauchtHotel: false,
  },
  eintrittspreise: {
    preisprofil: {
      name: "Freier Eintritt",
      regulaer: 0,
      rabattErmaessigt: 0,
      rabattMitglied: 0,
    },
    regulaer: 0,
    rabattErmaessigt: 0,
    rabattMitglied: 0,
    erwarteteBesucher: 0,
    zuschuss: 0,
  },
  hotel: {
    auswahl: "",
    name: "",
    ansprechpartner: "",
    telefon: "",
    email: "",
    adresse: "",
  },
  kasse: {
    anfangsbestandEUR: 500,
    ausgabeBankEUR: 0,
    ausgabeCateringEUR: 0,
    ausgabeGageEUR: 0,
    ausgabeHelferEUR: 0,
    ausgabeSonstiges1EUR: 0,
    ausgabeSonstiges2EUR: 0,
    ausgabeSonstiges3EUR: 0,
    einnahmeBankEUR: 0,
    einnahmeSonstiges1EUR: 0,
    einnahmeTicketsEUR: 0,
    einnahmeSonstiges2EUR: 0,
    ausgabeSonstiges1Text: "",
    ausgabeSonstiges2Text: "",
    ausgabeSonstiges3Text: "",
    einnahmeSonstiges1Text: "",
    einnahmeSonstiges2Text: "",
    anzahlBesucherAK: 0,
  },
  kopf: {
    beschreibung: "",
    eventTyp: "",
    flaeche: "",
    kooperation: "_",
    ort: "Jubez",
    titel: "",
    pressename: "",
    presseIn: "",
    genre: "",
    confirmed: false,
    rechnungAnKooperation: false,
  },
  kosten: {
    backlineEUR: 0,
    saalmiete: 0,
    technikAngebot1EUR: 0,
    gagenEUR: 0,
    werbung1: 0,
    werbung2: 0,
    werbung3: 0,
    personal: 0,
    gagenSteuer: null,
    deal: null,
    gageBAR: false,
  },
  presse: {
    originalText: "",
    text: "",
    image: [],
    checked: false,
    jazzclubURL: "",
  },
  staff: {
    techniker: [],
    technikerV: [],
    merchandise: [],
    kasse: [],
    kasseV: [],
    mod: [],
    technikerNotNeeded: false,
    technikerVNotNeeded: false,
    kasseNotNeeded: false,
    kasseVNotNeeded: false,
    modNotNeeded: false,
    merchandiseNotNeeded: false,
  },
  technik: {
    dateirider: [],
    backlineJazzclub: [],
    backlineRockshop: [],
    checked: false,
    fluegel: false,
  },
  unterkunft: {
    einzelNum: 0,
    doppelNum: 0,
    suiteNum: 0,
    einzelEUR: 0,
    doppelEUR: 0,
    suiteEUR: 0,
    transportEUR: 0,
    kommentar: "",
    transportText: "",
    sonstiges: [],
    angefragt: false,
    bestaetigt: false,
    anreiseDate: new Date(),
    abreiseDate: new Date(),
  },
  vertrag: {
    art: "Jazzclub" as Vertragsart,
    sprache: "Deutsch" as Sprache,
    datei: [],
  },
  salesrep: { id: "" },
};
const reference = JSON.parse(JSON.stringify(demo));
describe("Veranstaltung Gesamt", () => {
  let veranstaltung: Veranstaltung;

  beforeEach(() => {
    veranstaltung = new Veranstaltung(demo);
  });

  it("hat noch eigene Attribute", () => {
    expect(veranstaltung.id).to.eql(reference.id);
    expect(veranstaltung.url).to.eql(reference.url);
    expect(veranstaltung.startDate.toISOString()).to.eql(reference.startDate);
    expect(veranstaltung.endDate.toISOString()).to.eql(reference.endDate);
  });
});

describe("URL Generierung", () => {
  const date = new Date(2020, 4, 1);
  const titel = "Der Titel, der-auch kömische Ümläßte // enthält";

  it("formats the date usefully", () => {
    const url = Veranstaltung.createUrlFrom(date, titel);
    expect(url).to.eql("2020-05-01-der_titel_der-auch_komische_umlaste____enthalt");
  });
});
