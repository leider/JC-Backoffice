import writeXlsxFile, { Schema } from "write-excel-file";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import OptionValues from "jc-shared/optionen/optionValues.ts";
import { excelRows, VeranstaltungExcelRow } from "jc-shared/excelPreparation/excelRowVeranstaltung.ts";
import { anzahlCol, green, numCol, red } from "@/commons/excel/shared.ts";

export async function asExcelAuslastung({ veranstaltungen, optionen }: { veranstaltungen: Veranstaltung[]; optionen: OptionValues }) {
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
    { ...anzahlCol, column: "Explizit am Abend", value: (row) => row.anzahlBesucherAK },
    {
      column: "Gäste (Summe)",
      type: "Formula",
      format: "0",
      width: 22,
      value: (row) => `F${row.rowNo} + G${row.rowNo} + H${row.rowNo}`,
    },
    { ...anzahlCol, column: "Abendkasse (berechnet)", value: (row) => row.anzahlAbendkasse },
    { ...anzahlCol, column: "Reservix", value: (row) => row.anzahlReservix },
    { ...anzahlCol, column: "Spende", value: (row) => row.anzahlSpende },
    { ...numCol, column: "Eintrittspreise (Schnitt)", value: (row) => row.eintrittspreisSchnitt },
    {
      column: "Freigegeben",
      type: Boolean,
      value: (row) => row.kasseFreigegeben,
      getCellStyle: (row) => ({ backgroundColor: row.kasseFreigegeben ? green : red }),
    },
    { ...numCol, column: "Eintritt Abendkasse Bar", value: (row) => row.abendkasse },
    { ...numCol, column: "Einnahmen Reservix", value: (row) => row.reservix },
  ];
  const uebersichtRows = excelRows({ veranstaltungen, optionen, urlRoot });

  const erste = veranstaltungen[0];
  const letzte = veranstaltungen[veranstaltungen.length - 1];
  const von = erste.startDatumUhrzeit.tagMonatJahrKompakt;
  const bis = letzte.startDatumUhrzeit.tagMonatJahrKompakt;
  const vonBisString = von === bis ? von : `${von}-${bis}`;

  await writeXlsxFile(uebersichtRows, {
    schema: schemaUebersicht,
    sheet: "Übersicht",
    fileName: `Auslastung-${vonBisString}.xlsx`,
    stickyColumnsCount: 3,
  });
}
