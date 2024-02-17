import Konzert from "../konzert/konzert.js";
import Vermietung from "../vermietung/vermietung.js";
import KonzertKalkulation from "../konzert/konzertKalkulation.js";

type KeyNumber = { [index: string]: number };
type KeyNumberString = { [index: string]: number | string };

export interface Kennzahlen {
  name: string;
  kennzahlen: KeyNumber;
}

export function prepareExcel(veranstaltung: (Konzert | Vermietung)[]) {
  const kumuliert: { [index: string]: KeyNumber } = veranstaltung.reduce((bestehende, ver) => {
    const kennzahlen = ver.isVermietung ? kennzahlenFuerVermietung(ver as Vermietung) : kennzahlenFuerVeranstaltung(ver as Konzert);
    integrateKennzahlen(kennzahlen, bestehende);
    return bestehende;
  }, {});

  // const werbung1Row =createRow(  kosten.werbung1Label, Einnahme: "", Ausgabe: kosten.werbung1 || 0 };
  // const werbung2Row = createRow( kosten.werbung2Label, Einnahme: "", Ausgabe: kosten.werbung2 || 0 };
  // const werbung3Row = createRow( kosten.werbung3Label, Einnahme: "", Ausgabe: kosten.werbung3 || 0 };

  const rows = [
    createRow("Eintritt Abendkasse Bar", kumuliert),
    createRow("Einnahmen Reservix", kumuliert),
    createRow("Bar Einnahmen", kumuliert),
    createRow("Bar Einlage", kumuliert),
    createRow("Zuschüsse", kumuliert),
    createRow("Saalmiete", kumuliert),
    createRow("Barausgaben", kumuliert),
    createRow("Bar an Bank", kumuliert),
    createRow("Gagen", kumuliert),
    createRow("Gagen (Deal)", kumuliert),
    createRow("Provision Agentur", kumuliert),
    createRow("Backline Rockshop", kumuliert),
    createRow("Technik Zumietung", kumuliert),
    createRow("Flügelstimmer", kumuliert),
    createRow("Saalmiete (extern)", kumuliert),
    createRow("Personal", kumuliert),
    createRow("Hotel", kumuliert),
    createRow("Hotel (Transport)", kumuliert),
  ];

  Object.keys(kumuliert).forEach((key) => {
    rows.push(createRow(key, kumuliert));
  });
  return rows;
}

function createRow(art: string, kumuliert: { [index: string]: KeyNumber }) {
  const row: KeyNumberString = { Art: art, Summe: 0 };
  const element = kumuliert[art];
  row.Summe = element
    ? Object.keys(element).reduce((sum, key) => {
        row[key] = element[key];
        return sum + element[key];
      }, 0)
    : 0;
  // eslint-disable-next-line no-delete-var
  delete kumuliert[art];
  return row;
}

function integrateKennzahlen(kennzahlen: Kennzahlen, bestehende: { [index: string]: KeyNumber }) {
  Object.keys(kennzahlen.kennzahlen).forEach((key) => {
    if (!bestehende[key]) {
      bestehende[key] = {};
    }
    bestehende[key][kennzahlen.name] = kennzahlen.kennzahlen[key];
  });
}
function einnahme(betrag?: number) {
  return betrag || 0;
}

function ausgabe(betrag?: number) {
  return (betrag || -0) * -1;
}

function kennzahlenFuerVeranstaltung(veranstaltung: Konzert): Kennzahlen {
  const kasse = veranstaltung.kasse;
  const kalk = new KonzertKalkulation(veranstaltung);
  const kosten = veranstaltung.kosten;
  const result: KeyNumber = {
    "Eintritt Abendkasse Bar": einnahme(kasse.einnahmeTicketsEUR),
    "Einnahmen Reservix": einnahme(kasse.einnahmenReservix),
    "Bar Einnahmen": einnahme(kasse.einnahmeOhneBankUndTickets),
    "Bar Einlage": einnahme(kasse.einnahmeBankEUR),
    Zuschüsse: einnahme(veranstaltung.eintrittspreise.zuschuss),
    Barausgaben: ausgabe(kasse.ausgabenOhneGage),
    "Bar an Bank": ausgabe(kasse.ausgabeBankEUR),
    Gagen: ausgabe(kosten.gagenTotalEUR),
    "Gagen (Deal)": ausgabe(kalk.dealAbsolutEUR),
    "Provision Agentur": ausgabe(kosten.provisionAgentur),
    "Backline Rockshop": ausgabe(kosten.backlineEUR),
    "Technik Zumietung": ausgabe(kosten.technikAngebot1EUR),
    Flügelstimmer: ausgabe(kosten.fluegelstimmerEUR),
    "Saalmiete (extern)": ausgabe(kosten.saalmiete),
    Personal: ausgabe(kosten.personal),
    Tontechniker: ausgabe(kosten.tontechniker),
    Lichttechniker: ausgabe(kosten.lichttechniker),
    "Catering Musiker": ausgabe(kosten.cateringMusiker),
    "Catering Personal": ausgabe(kosten.cateringPersonal),
    Hotel: ausgabe(veranstaltung.unterkunft.roomsTotalEUR),
    "Hotel (Transport)": ausgabe(veranstaltung.unterkunft.transportEUR),
  };
  if (kasse.einnahmeSonstiges1EUR && kasse.einnahmeSonstiges1EUR !== 0) {
    result[kasse.einnahmeSonstiges1Text || "Einnahme Sonstiges 1"] = einnahme(kasse.einnahmeSonstiges1EUR);
  }
  if (kasse.einnahmeSonstiges2EUR && kasse.einnahmeSonstiges2EUR !== 0) {
    result[kasse.einnahmeSonstiges2Text || "Einnahme Sonstiges 2"] = einnahme(kasse.einnahmeSonstiges2EUR);
  }
  if (kosten.werbung1 && kosten.werbung1 !== 0) {
    result[kosten.werbung1Label] = ausgabe(kosten.werbung1);
  }
  if (kosten.werbung2 && kosten.werbung2 !== 0) {
    result[kosten.werbung2Label] = ausgabe(kosten.werbung2);
  }
  if (kosten.werbung3 && kosten.werbung3 !== 0) {
    result[kosten.werbung3Label] = ausgabe(kosten.werbung3);
  }
  return { kennzahlen: result, name: `${veranstaltung.startDatumUhrzeit.mitUhrzeitNumerisch}/${veranstaltung.kopf.titel}` };
}

function kennzahlenFuerVermietung(vermietung: Vermietung): Kennzahlen {
  const kosten = vermietung.kosten;
  const result: KeyNumber = {
    Gagen: ausgabe(kosten.gagenTotalEUR),
    "Backline Rockshop": ausgabe(kosten.backlineEUR),
    "Technik Zumietung": ausgabe(kosten.technikAngebot1EUR),
    Flügelstimmer: ausgabe(kosten.fluegelstimmerEUR),
    Saalmiete: einnahme(vermietung.saalmiete),
    Personal: ausgabe(kosten.personal),
  };
  if (kosten.werbung1 && kosten.werbung1 !== 0) {
    result[kosten.werbung1Label] = ausgabe(kosten.werbung1);
  }
  if (kosten.werbung2 && kosten.werbung2 !== 0) {
    result[kosten.werbung2Label] = ausgabe(kosten.werbung2);
  }
  if (kosten.werbung3 && kosten.werbung3 !== 0) {
    result[kosten.werbung3Label] = ausgabe(kosten.werbung3);
  }
  return { kennzahlen: result, name: `${vermietung.startDatumUhrzeit.mitUhrzeitNumerisch}/${vermietung.kopf.titel}` };
}
