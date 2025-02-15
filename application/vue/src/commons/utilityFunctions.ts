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

const numCol = { type: Number, format: "#,##0.00", width: 22 };

export async function asExcelKalk({ veranstaltungen, optionen }: { veranstaltungen: Veranstaltung[]; optionen: OptionValues }) {
  if (veranstaltungen.length < 1) {
    return;
  }

  const urlRoot = window.location.origin + "/vue";

  const schemaUebersicht: Schema<VeranstaltungExcelRow> = [
    { column: "Datum", type: Date, format: "dd.mm.yyyy", value: (row) => row.datum, width: 12 },
    {
      column: "Titel (URL)",
      type: "Formula",
      value: (row) => `HYPERLINK("${row.url}", "${row.titel.replaceAll('"', '""')}")`,
      width: 30,
    },
    {
      column: "Typ",
      type: String,
      value: (row) => row.typ,
      width: 22,
      getCellStyle: (row) => ({ backgroundColor: row.color }),
    },
    {
      column: "Summe (Einnahmen)",
      type: "Formula",
      format: "#,##0.00",
      width: 22,
      value: (row) => `E${row.rowNo} + F${row.rowNo} + G${row.rowNo}`,
    },
    { ...numCol, column: "Eintritt Abendkasse Bar", value: (row) => row.abendkasse },
    { ...numCol, column: "Einnahmen Reservix", value: (row) => row.reservix },
    { ...numCol, column: "Bar Einnahmen", value: (row) => row.einnahmenBar },
    { ...numCol, column: "Bar Einlage", value: (row) => row.einlageBar },
    { ...numCol, column: "Zuschüsse", value: (row) => row.zuschuss },
    { ...numCol, column: "Spende", value: (row) => row.spende },
    { ...numCol, column: "Einnahme 1", value: (row) => row.einnahme1 },
    { column: "(Text)", type: String, value: (row) => row.einnahme1Text },
    { ...numCol, column: "Einnahme 2", value: (row) => row.einnahme2 },
    { column: "(Text)", type: String, value: (row) => row.einnahme2Text },
    { ...numCol, column: "Saalmiete", value: (row) => row.saalmiete },
    { ...numCol, column: "Barausgaben", value: (row) => row.ausgabenBar },
    { ...numCol, column: "Bar an Bank", value: (row) => row.anBank },
    { ...numCol, column: "Gagen", value: (row) => row.gage },
    { ...numCol, column: "Gagen (Deal)", value: (row) => row.deal },
    { ...numCol, column: "Provision Agentur", value: (row) => row.provision },
    { ...numCol, column: "Backline Rockshop", value: (row) => row.backline },
    { ...numCol, column: "Technik Zumietung", value: (row) => row.technik },
    { ...numCol, column: "Flügelstimmer", value: (row) => row.fluegel },
    { ...numCol, column: "Personal", value: (row) => row.personal },
    { ...numCol, column: "Hotel", value: (row) => row.hotel },
    { ...numCol, column: "Hotel (Transport)", value: (row) => row.hotelTransport },
    {
      ...numCol,
      column: "Tontechniker",
      value: (row) => (row.tontechniker === "N/A" ? 0 : row.tontechniker),
      getCellStyle: (row) => {
        return row.tontechniker === "N/A" ? { backgroundColor: red } : undefined;
      },
    },
    {
      ...numCol,
      column: "Lichttechniker",
      value: (row) => (row.lichttechniker === "N/A" ? 0 : row.lichttechniker),
      getCellStyle: (row) => {
        return row.tontechniker === "N/A" ? { backgroundColor: red } : undefined;
      },
    },
    { ...numCol, column: "Catering Musiker", value: (row) => row.cateringMusiker },
    { ...numCol, column: "Catering Personal", value: (row) => row.cateringPersonal },
    { ...numCol, column: "KSK", value: (row) => row.ksk },
    { ...numCol, column: "GEMA", value: (row) => row.gema },
    { ...numCol, column: "Werbung 1", value: (row) => row.werbung1 },
    { column: "(Text)", type: String, value: (row) => row.werbung1Text },
    { ...numCol, column: "Werbung 2", value: (row) => row.werbung2 },
    { column: "(Text)", type: String, value: (row) => row.werbung2Text },
    { ...numCol, column: "Werbung 3", value: (row) => row.werbung3 },
    { column: "(Text)", type: String, value: (row) => row.werbung3Text },
    { ...numCol, column: "Werbung 4", value: (row) => row.werbung4 },
    { column: "(Text)", type: String, value: (row) => row.werbung4Text },
    { ...numCol, column: "Werbung 5", value: (row) => row.werbung5 },
    { column: "(Text)", type: String, value: (row) => row.werbung5Text },
    { ...numCol, column: "Werbung 6", value: (row) => row.werbung6 },
    { column: "(Text)", type: String, value: (row) => row.werbung6Text },
  ];
  const uebersichtRows = excelRows({ veranstaltungen, optionen, urlRoot });

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

  const allSchemas: Schema<unknown>[] = [schemaUebersicht, ...schemas];

  await writeXlsxFile([uebersichtRows, allSingles], {
    schema: allSchemas,
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
