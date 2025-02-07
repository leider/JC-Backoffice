import writeXlsxFile, { Schema } from "write-excel-file";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import OptionValues from "jc-shared/optionen/optionValues.ts";
import { excelRows, VeranstaltungExcelRow } from "jc-shared/excelPreparation/excelRowVeranstaltung.ts";
import { createExcelData, SimpleExcelRow } from "jc-shared/excelPreparation/excelFormatters.ts";
import map from "lodash/map";
import times from "lodash/times";
import truncate from "lodash/truncate";

const red = "#e8838a";

const format = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

export function formatToGermanNumberString(amount: number): string {
  return format.format(amount);
}

export async function asExcelKalk({ veranstaltungen, optionen }: { veranstaltungen: Veranstaltung[]; optionen: OptionValues }) {
  if (veranstaltungen.length < 1) {
    return;
  }
  const schemaUebersicht: Schema<VeranstaltungExcelRow> = [
    { column: "Datum", type: Date, format: "dd.mm.yyyy", value: (row) => row.datum, width: 12 },
    { column: "Titel", type: String, value: (row) => row.titel, width: 30 },
    {
      column: "Typ",
      type: String,
      value: (row) => row.typ,
      width: 22,
      getCellStyle: (row) => ({ backgroundColor: row.color }),
    },
    { column: "Eintritt Abendkasse Bar", type: Number, format: "#,##0.00", width: 22, value: (row) => row.abendkasse },
    { column: "Einnahmen Reservix", type: Number, format: "#,##0.00", width: 22, value: (row) => row.reservix },
    { column: "Bar Einnahmen", type: Number, format: "#,##0.00", width: 22, value: (row) => row.einnahmenBar },
    { column: "Bar Einlage", type: Number, format: "#,##0.00", width: 22, value: (row) => row.einlageBar },
    { column: "Zuschüsse", type: Number, format: "#,##0.00", width: 22, value: (row) => row.zuschuss },
    { column: "Spende", type: Number, format: "#,##0.00", width: 22, value: (row) => row.spende },
    { column: "Einnahme 1", type: Number, format: "#,##0.00", width: 22, value: (row) => row.einnahme1 },
    { column: "(Text)", type: String, value: (row) => row.einnahme1Text },
    { column: "Einnahme 2", type: Number, format: "#,##0.00", width: 22, value: (row) => row.einnahme2 },
    { column: "(Text)", type: String, value: (row) => row.einnahme2Text },
    { column: "Saalmiete", type: Number, format: "#,##0.00", width: 22, value: (row) => row.saalmiete },
    { column: "Barausgaben", type: Number, format: "#,##0.00", width: 22, value: (row) => row.ausgabenBar },
    { column: "Bar an Bank", type: Number, format: "#,##0.00", width: 22, value: (row) => row.anBank },
    { column: "Gagen", type: Number, format: "#,##0.00", width: 22, value: (row) => row.gage },
    { column: "Gagen (Deal)", type: Number, format: "#,##0.00", width: 22, value: (row) => row.deal },
    { column: "Provision Agentur", type: Number, format: "#,##0.00", width: 22, value: (row) => row.provision },
    { column: "Backline Rockshop", type: Number, format: "#,##0.00", width: 22, value: (row) => row.backline },
    { column: "Technik Zumietung", type: Number, format: "#,##0.00", width: 22, value: (row) => row.technik },
    { column: "Flügelstimmer", type: Number, format: "#,##0.00", width: 22, value: (row) => row.fluegel },
    { column: "Personal", type: Number, format: "#,##0.00", width: 22, value: (row) => row.personal },
    { column: "Hotel", type: Number, format: "#,##0.00", width: 22, value: (row) => row.hotel },
    { column: "Hotel (Transport)", type: Number, format: "#,##0.00", width: 22, value: (row) => row.hotelTransport },
    {
      column: "Tontechniker",
      type: Number,
      format: "#,##0.00",
      width: 22,
      value: (row) => (row.tontechniker === "N/A" ? 0 : row.tontechniker),
      getCellStyle: (row) => {
        return row.tontechniker === "N/A" ? { backgroundColor: red } : undefined;
      },
    },
    {
      column: "Lichttechniker",
      type: Number,
      format: "#,##0.00",
      width: 22,
      value: (row) => (row.lichttechniker === "N/A" ? 0 : row.lichttechniker),
      getCellStyle: (row) => {
        return row.tontechniker === "N/A" ? { backgroundColor: red } : undefined;
      },
    },
    { column: "Catering Musiker", type: Number, format: "#,##0.00", width: 22, value: (row) => row.cateringMusiker },
    { column: "Catering Personal", type: Number, format: "#,##0.00", width: 22, value: (row) => row.cateringPersonal },
    { column: "KSK", type: Number, format: "#,##0.00", width: 22, value: (row) => row.ksk },
    { column: "GEMA", type: Number, format: "#,##0.00", width: 22, value: (row) => row.gema },
    { column: "Werbung 1", type: Number, format: "#,##0.00", width: 22, value: (row) => row.werbung1 },
    { column: "(Text)", type: String, value: (row) => row.werbung1Text },
    { column: "Werbung 2", type: Number, format: "#,##0.00", width: 22, value: (row) => row.werbung2 },
    { column: "(Text)", type: String, value: (row) => row.werbung2Text },
    { column: "Werbung 3", type: Number, format: "#,##0.00", width: 22, value: (row) => row.werbung3 },
    { column: "(Text)", type: String, value: (row) => row.werbung3Text },
    { column: "Werbung 4", type: Number, format: "#,##0.00", width: 22, value: (row) => row.werbung4 },
    { column: "(Text)", type: String, value: (row) => row.werbung4Text },
    { column: "Werbung 5", type: Number, format: "#,##0.00", width: 22, value: (row) => row.werbung5 },
    { column: "(Text)", type: String, value: (row) => row.werbung5Text },
    { column: "Werbung 6", type: Number, format: "#,##0.00", width: 22, value: (row) => row.werbung6 },
    { column: "(Text)", type: String, value: (row) => row.werbung6Text },
  ];
  const uebersichtRows = excelRows({ veranstaltungen, optionen });

  const erste = veranstaltungen[0];
  const letzte = veranstaltungen[veranstaltungen.length - 1];
  const von = erste.startDatumUhrzeit.tagMonatJahrKompakt;
  const bis = letzte.startDatumUhrzeit.tagMonatJahrKompakt;
  const vonBisString = von === bis ? von : `${von}-${bis}`;

  const allSingles = map(veranstaltungen, (ver) => createExcelData({ veranstaltung: ver, optionen }));

  const noOfSheets = allSingles.length;

  const schemas = times(noOfSheets, () => schemaSingle);
  const names = map(veranstaltungen, (ver) => {
    const start = ver.startDatumUhrzeit;
    return truncate(`${start.tag}.${start.monat}. ${ver.kopf.titel.replace(/[[\]/\\:*?]+/g, "-")}`, { length: 31 });
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  await writeXlsxFile([uebersichtRows, ...allSingles], {
    schema: [schemaUebersicht, ...schemas],
    sheets: ["Übersicht", ...names],
    fileName: `Kalkulation-${vonBisString}.xlsx`,
    stickyColumnsCount: 3,
  });
}

const schemaSingle: Schema<SimpleExcelRow> = [
  {
    column: "Art",
    type: String,
    value: (row) => row.Art,
    width: 30,
    getCellStyle: (row) => (/[0-9]{2}.[0-9]{2}.[0-9]{2}/.test(row.Art) ? { span: 3, fontWeight: "bold" } : undefined),
  },
  { column: "Einnahme", type: Number, format: "#,##0.00", value: (row) => row.Einnahme },
  {
    column: "Ausgabe",
    type: Number,
    format: "#,##0.00",
    value: (row) => (row.Ausgabe === "N/A" ? 0 : row.Ausgabe),
    getCellStyle: (row) => {
      return row.Ausgabe === "N/A" ? { backgroundColor: red } : undefined;
    },
  },
];

export async function asExcelKalkSingle({ veranstaltung, optionen }: { veranstaltung: Veranstaltung; optionen: OptionValues }) {
  const rows = createExcelData({ veranstaltung, optionen });

  await writeXlsxFile(rows, {
    schema: schemaSingle,
    fileName: `Kalkulation-${veranstaltung.kopf.titel}.xlsx`,
    stickyColumnsCount: 3,
  });
}
