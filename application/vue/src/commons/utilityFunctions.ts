import Konzert from "jc-shared/konzert/konzert.ts";
import { utils, writeFileXLSX } from "xlsx";
import { createExcelData, createExcelDataVermietung } from "jc-shared/excelPreparation/excelFormatters.ts";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { prepareExcel } from "jc-shared/excelPreparation/excelKumulierer.ts";
import forEach from "lodash/forEach";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";

const format = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

export function formatToGermanNumberString(amount: number): string {
  return format.format(amount);
}

export function asExcelKalk(veranstaltung: Veranstaltung[]) {
  if (veranstaltung.length < 1) {
    return;
  }
  const book = utils.book_new();
  const sheet = utils.json_to_sheet(prepareExcel(veranstaltung));
  sheet["!cols"] = [{ wch: 30 }, { wch: 6 }, { wch: 10 }];
  utils.book_append_sheet(book, sheet, "Übersicht");

  forEach(veranstaltung, (ver) => {
    const sheet = utils.json_to_sheet(ver.isVermietung ? createExcelDataVermietung(ver as Vermietung) : createExcelData(ver as Konzert));
    sheet["!cols"] = [{ wch: 30 }, { wch: 6 }, { wch: 10 }];
    utils.book_append_sheet(
      book,
      sheet,
      `${ver?.startDatumUhrzeit.tagMonatJahrKompakt}-${ver?.kopf?.titel}`
        .replace(/\s/g, "-")
        .replace(/\//g, "-")
        .replace(/[^a-zA-Z0-9\- _]/g, "")
        .slice(0, 30) || "data",
    );
  });
  const erste = veranstaltung[0];
  const letzte = veranstaltung[veranstaltung.length - 1];
  const von = erste.startDatumUhrzeit.tagMonatJahrKompakt;
  const bis = letzte.startDatumUhrzeit.tagMonatJahrKompakt;
  const vonBisString = von === bis ? von : von + "-" + bis;
  writeFileXLSX(book, `Kalkulation-${vonBisString}.xlsx`);
}
