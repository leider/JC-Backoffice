import Konzert from "../konzert/konzert.js";
import Vermietung from "../vermietung/vermietung.js";
import KonzertKalkulation from "../konzert/konzertKalkulation.js";
import Veranstaltung from "../veranstaltung/veranstaltung.js";
import Kosten from "../veranstaltung/kosten.js";
import OptionValues, { colorVermietung } from "../optionen/optionValues.js";
import map from "lodash/map.js";
import tinycolor from "tinycolor2";

export type VeranstaltungExcelRow = {
  rowNo: number;
  datum: Date;
  titel: string;
  url: string;
  typ: string;
  color: string;
  abendkasse?: number;
  reservix?: number;
  einnahmenBar?: number;
  ausgabenBar?: number;
  anBank?: number;
  gage?: number;
  deal?: number;
  provision?: number;
  technik?: number;
  fluegel?: number;
  saalmiete?: number;
  personal?: number;
  tontechniker?: number | "N/A";
  lichttechniker?: number | "N/A";
  cateringMusiker?: number;
  hotel?: number;
  hotelTransport?: number;
  ksk?: number;
  gema?: number;
  spende?: number;
  einnahme1?: number;
  einnahme1Text?: string;
  einnahme2?: number;
  einnahme2Text?: string;
  werbung1?: number;
  werbung1Text?: string;
  werbung2?: number;
  werbung2Text?: string;
  werbung3?: number;
  werbung3Text?: string;
  werbung4?: number;
  werbung4Text?: string;
  werbung5?: number;
  werbung5Text?: string;
  werbung6?: number;
  werbung6Text?: string;
  anzahlReservix?: number;
  anzahlAbendkasse?: number;
  anzahlBesucherAK?: number;
  anzahlBesucherErwartet?: number;
  anzahlSpende?: number;
  eintrittspreisSchnitt?: number;
  kasseFreigegeben?: boolean;
};

function einnahme(betrag?: number) {
  return betrag ?? 0;
}

function einnahmeGanzzahl(betrag?: number) {
  return Math.round(betrag ?? 0);
}

function ausgabe(betrag?: number) {
  return (betrag ?? -0) * -1;
}

function isSpende(name: string) {
  return ["spende", "spenden", "Spende", "Spenden"].includes(name);
}

function fillWerbung(row: VeranstaltungExcelRow, kosten: Kosten) {
  if (kosten.werbung1 && kosten.werbung1 !== 0) {
    row.werbung1 = ausgabe(kosten.werbung1);
    row.werbung1Text = kosten.werbung1Label;
  }
  if (kosten.werbung2 && kosten.werbung2 !== 0) {
    row.werbung2 = ausgabe(kosten.werbung2);
    row.werbung2Text = kosten.werbung2Label;
  }
  if (kosten.werbung3 && kosten.werbung3 !== 0) {
    row.werbung3 = ausgabe(kosten.werbung3);
    row.werbung3Text = kosten.werbung3Label;
  }
  if (kosten.werbung4 && kosten.werbung4 !== 0) {
    row.werbung4 = ausgabe(kosten.werbung4);
    row.werbung4Text = kosten.werbung4Label;
  }
  if (kosten.werbung5 && kosten.werbung5 !== 0) {
    row.werbung5 = ausgabe(kosten.werbung5);
    row.werbung5Text = kosten.werbung5Label;
  }
  if (kosten.werbung6 && kosten.werbung6 !== 0) {
    row.werbung6 = ausgabe(kosten.werbung6);
    row.werbung6Text = kosten.werbung6Label;
  }
  return row;
}

export function excelRows({
  veranstaltungen,
  optionen,
  urlRoot,
}: {
  veranstaltungen: Veranstaltung[];
  optionen: OptionValues;
  urlRoot: string;
}) {
  const klavierStimmerDefault = optionen.preisKlavierstimmer;
  return map(veranstaltungen, (veranstaltung, index) => excelRowVeranstaltung({ veranstaltung, klavierStimmerDefault, urlRoot, index }));
}

function excelRowVeranstaltung({
  veranstaltung,
  klavierStimmerDefault,
  urlRoot,
  index,
}: {
  veranstaltung: Veranstaltung;
  klavierStimmerDefault: number;
  urlRoot: string;
  index: number;
}) {
  return veranstaltung.isVermietung ? excelRowVermietung(veranstaltung as Vermietung) : excelRowKonzert(veranstaltung as Konzert);

  function excelRowKonzert(konzert: Konzert) {
    const kasse = konzert.kasse;
    const kalk = new KonzertKalkulation(konzert);
    const kosten = konzert.kosten;
    const staff = konzert.staff;
    const klavierStimmerStandard = konzert.technik.fluegel ? klavierStimmerDefault : 0;
    const eintrittspreise = konzert.eintrittspreise;
    const eintrittspreisSchnitt = eintrittspreise.eintrittspreisSchnitt;
    const result: VeranstaltungExcelRow = {
      rowNo: index + 2,
      datum: konzert.startDatumUhrzeit.toJSDate,
      titel: konzert.kopf.titel,
      url: `${urlRoot}${konzert.fullyQualifiedUrl}`,
      typ: konzert.kopf.eventTypRich?.name ?? "",
      color: tinycolor(konzert.kopf.eventTypRich?.color ?? "#FFF").toHexString(),
      abendkasse: einnahme(kasse.einnahmeTicketsEUR),
      reservix: einnahme(kasse.einnahmenReservix),
      einnahmenBar: einnahme(kasse.einnahmeOhneBankUndTickets),
      ausgabenBar: ausgabe(kasse.ausgabenOhneGage),
      anBank: ausgabe(kasse.ausgabeBankEUR),
      gage: ausgabe(kosten.gagenTotalEUR),
      deal: ausgabe(kalk.dealAbsolutEUR),
      provision: ausgabe(kosten.provisionAgentur),
      technik: ausgabe(kosten.technikAngebot1EUR),
      fluegel: ausgabe(kosten.fluegelstimmerEUR || klavierStimmerStandard),
      saalmiete: ausgabe(kosten.saalmiete),
      personal: ausgabe(kosten.personal),
      tontechniker: !staff.technikerVNotNeeded && !kosten.tontechniker ? "N/A" : ausgabe(kosten.tontechniker),
      lichttechniker: !staff.technikerNotNeeded && !kosten.lichttechniker ? "N/A" : ausgabe(kosten.lichttechniker),
      cateringMusiker: ausgabe(kosten.cateringMusiker),
      hotel: ausgabe(konzert.unterkunft.roomsTotalEUR),
      hotelTransport: ausgabe(konzert.unterkunft.transportEUR),
      ksk: ausgabe(kosten.ksk),
      gema: ausgabe(kalk.gema),
      eintrittspreisSchnitt: einnahme(eintrittspreisSchnitt),
      anzahlReservix: einnahmeGanzzahl(kasse.anzahlReservix || kasse.einnahmenReservix / (eintrittspreisSchnitt || 1)),
      anzahlBesucherAK: einnahmeGanzzahl(kasse.anzahlBesucherAK),
      anzahlBesucherErwartet: einnahmeGanzzahl(eintrittspreise.erwarteteBesucher),
      anzahlAbendkasse: einnahmeGanzzahl(kasse.einnahmeTicketsEUR / (eintrittspreisSchnitt || 1)),
      kasseFreigegeben: kasse.istFreigegeben,
    };
    if (kasse.einnahmeSonstiges1EUR && kasse.einnahmeSonstiges1EUR !== 0) {
      if (isSpende(kasse.einnahmeSonstiges1Text)) {
        result.spende = kasse.einnahmeSonstiges1EUR;
      } else {
        result.einnahme1 = kasse.einnahmeSonstiges1EUR;
        result.einnahme1Text = kasse.einnahmeSonstiges1Text;
      }
    }
    if (kasse.einnahmeSonstiges2EUR && kasse.einnahmeSonstiges2EUR !== 0) {
      if (isSpende(kasse.einnahmeSonstiges2Text)) {
        result.spende = kasse.einnahmeSonstiges2EUR;
      } else {
        result.einnahme2 = kasse.einnahmeSonstiges2EUR;
        result.einnahme2Text = kasse.einnahmeSonstiges2Text;
      }
    }
    result.anzahlSpende = einnahmeGanzzahl((result.spende ?? 0) / 10);

    return fillWerbung(result, kosten);
  }

  function excelRowVermietung(vermietung: Vermietung) {
    const kosten = vermietung.kosten;
    const klavierStimmerStandard = vermietung.technik.fluegel ? klavierStimmerDefault : 0;

    const result: VeranstaltungExcelRow = {
      rowNo: index + 2,
      datum: vermietung.startDatumUhrzeit.toJSDate,
      titel: vermietung.kopf.titel,
      url: `${urlRoot}${vermietung.fullyQualifiedUrl}`,
      color: colorVermietung,
      typ: "Vermietung",
      gage: ausgabe(kosten.gagenTotalEUR),
      technik: ausgabe(kosten.technikAngebot1EUR),
      fluegel: ausgabe(kosten.fluegelstimmerEUR || klavierStimmerStandard),
      saalmiete: einnahme(vermietung.saalmiete),
      personal: ausgabe(kosten.personal),
    };
    return fillWerbung(result, kosten);
  }
}
