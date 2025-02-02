import Konzert from "jc-shared/konzert/konzert.ts";
import { utils, writeFileXLSX } from "xlsx";
import { createExcelData, createExcelDataVermietung } from "jc-shared/excelPreparation/excelFormatters.ts";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { prepareExcel } from "jc-shared/excelPreparation/excelKumulierer.ts";
import forEach from "lodash/forEach";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import OptionValues from "jc-shared/optionen/optionValues.ts";

const format = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

export function formatToGermanNumberString(amount: number): string {
  return format.format(amount);
}

export function asExcelKalk({ veranstaltungen, optionen }: { veranstaltungen: Veranstaltung[]; optionen: OptionValues }) {
  if (veranstaltungen.length < 1) {
    return;
  }
  const book = utils.book_new();
  const sheet = utils.json_to_sheet(prepareExcel({ veranstaltungen, optionen }));
  sheet["!cols"] = [{ wch: 30 }, { wch: 6 }, { wch: 10 }];
  utils.book_append_sheet(book, sheet, "Übersicht");

  forEach(veranstaltungen, (ver) => {
    const rows = ver.isVermietung
      ? createExcelDataVermietung({ vermietung: ver as Vermietung, optionen })
      : createExcelData({ konzert: ver as Konzert, optionen });
    const sheet = utils.json_to_sheet(rows);
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
  const erste = veranstaltungen[0];
  const letzte = veranstaltungen[veranstaltungen.length - 1];
  const von = erste.startDatumUhrzeit.tagMonatJahrKompakt;
  const bis = letzte.startDatumUhrzeit.tagMonatJahrKompakt;
  const vonBisString = von === bis ? von : von + "-" + bis;
  writeFileXLSX(book, `Kalkulation-${vonBisString}.xlsx`);
}
