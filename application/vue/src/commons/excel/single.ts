import writeXlsxFile, { Schema } from "write-excel-file";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import OptionValues from "jc-shared/optionen/optionValues.ts";
import { createExcelData, SimpleExcelRow } from "jc-shared/excelPreparation/excelFormatters.ts";
import { red } from "@/commons/excel/shared.ts";

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
