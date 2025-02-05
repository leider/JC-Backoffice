import Konzert from "../konzert/konzert.js";
import KonzertKalkulation from "../konzert/konzertKalkulation.js";
import Vermietung from "../vermietung/vermietung.js";
import OptionValues from "../optionen/optionValues.js";
import Veranstaltung from "../veranstaltung/veranstaltung.js";

export function unifySpende(name: string) {
  const spendeVariations = ["spende", "spenden", "Spende", "Spenden"];
  return spendeVariations.includes(name) ? "Spende" : name;
}

export type SimpleExcelRow = {
  Art: string;
  Einnahme?: number;
  Ausgabe?: number | "N/A";
};

export function createExcelData({ veranstaltung, optionen }: { veranstaltung: Veranstaltung; optionen: OptionValues }) {
  const klavierStimmerStandard = veranstaltung.technik.fluegel ? optionen.preisKlavierstimmer : 0;

  return veranstaltung.isVermietung
    ? createExcelDataVermietung(veranstaltung as Vermietung)
    : createExcelDataKonzert(veranstaltung as Konzert);

  function createExcelDataKonzert(konzert: Konzert): SimpleExcelRow[] {
    const kasse = konzert.kasse;
    const kosten = konzert.kosten;
    const staff = konzert.staff;
    const kalk = new KonzertKalkulation(konzert);

    const titelZeile = { Art: konzert.kopf.titel + " - " + konzert.startDatumUhrzeit.mitUhrzeitNumerisch };
    // Einnahmen
    const eintrittRow = {
      Art: `Eintritt (${kasse.istFreigegeben ? "" : "nicht "}freigegeben)`,
      Einnahme: kasse.einnahmeTicketsEUR ?? 0,
      Ausgabe: "",
    };
    const reservixRow = {
      Art: "Eintritt Reservix",
      Einnahme: kasse.einnahmenReservix ?? 0,
      Ausgabe: "",
    };
    const barEinnahmenRow = { Art: "Bar Einnahmen", Einnahme: kasse.einnahmeOhneBankUndTickets ?? 0, Ausgabe: "" };
    const barEinlageRow = { Art: "Bar Einlage", Einnahme: kasse.einnahmeBankEUR ?? 0, Ausgabe: "" };
    const zuschussRow = { Art: "Zuschüsse", Einnahme: konzert.eintrittspreise.zuschuss ?? 0, Ausgabe: "" };
    // Ausgaben
    const barAusgabenRow = { Art: "Barausgaben", Einnahme: "", Ausgabe: kasse.ausgabenOhneGage ?? 0 };
    const barAnBankRow = { Art: "Bar an Bank", Einnahme: "", Ausgabe: kasse.ausgabeBankEUR ?? 0 };

    const gagenRow = { Art: "Gagen", Einnahme: "", Ausgabe: kosten.gagenTotalEUR ?? 0 };
    const dealRow = { Art: "Gagen (Deal)", Einnahme: "", Ausgabe: kalk.dealAbsolutEUR ?? 0 };
    const provisionRow = { Art: "Provision Agentur", Einnahme: "", Ausgabe: kosten.provisionAgentur ?? 0 };
    const backlineRockshopRow = { Art: "Backline Rockshop", Einnahme: "", Ausgabe: kosten.backlineEUR ?? 0 };
    const technikZumietungRow = { Art: "Technik Zumietung", Einnahme: "", Ausgabe: kosten.technikAngebot1EUR ?? 0 };
    const fluegelStimmerRow = {
      Art: "Flügelstimmer",
      Einnahme: "",
      Ausgabe: kosten.fluegelstimmerEUR || klavierStimmerStandard,
    };
    const saalmieteRow = { Art: "Saalmiete", Einnahme: "", Ausgabe: kosten.saalmiete ?? 0 };
    const werbung1Row = { Art: kosten.werbung1Label, Einnahme: "", Ausgabe: kosten.werbung1 ?? 0 };
    const werbung2Row = { Art: kosten.werbung2Label, Einnahme: "", Ausgabe: kosten.werbung2 ?? 0 };
    const werbung3Row = { Art: kosten.werbung3Label, Einnahme: "", Ausgabe: kosten.werbung3 ?? 0 };
    const personalRow = { Art: "Personal (unbar)", Einnahme: "", Ausgabe: kosten.personal ?? 0 };
    const tontechnikerRow = {
      Art: "Tontechniker",
      Einnahme: "",
      Ausgabe: !staff.technikerVNotNeeded && !kosten.tontechniker ? "N/A" : kosten.tontechniker,
    };
    const lichttechnikerRow = {
      Art: "Lichttechniker",
      Einnahme: "",
      Ausgabe: !staff.technikerNotNeeded && !kosten.lichttechniker ? "N/A" : kosten.lichttechniker,
    };
    const cateringMusikerRow = { Art: "Catering (Musiker)", Einnahme: "", Ausgabe: kosten.cateringMusiker ?? 0 };
    const cateringPersonalRow = { Art: "Catering (Personal)", Einnahme: "", Ausgabe: kosten.cateringPersonal ?? 0 };
    const hotelRow = { Art: "Hotel", Einnahme: "", Ausgabe: konzert.unterkunft.roomsTotalEUR ?? 0 };
    const hotelTransportRow = { Art: "Hotel (Transport)", Einnahme: "", Ausgabe: konzert.unterkunft.transportEUR ?? 0 };

    return [
      titelZeile,
      eintrittRow,
      reservixRow,
      barEinnahmenRow,
      barEinlageRow,
      zuschussRow,
      barAusgabenRow,
      barAnBankRow,
      gagenRow,
      dealRow,
      provisionRow,
      backlineRockshopRow,
      technikZumietungRow,
      fluegelStimmerRow,
      saalmieteRow,
      werbung1Row,
      werbung2Row,
      werbung3Row,
      personalRow,
      tontechnikerRow,
      lichttechnikerRow,
      cateringMusikerRow,
      cateringPersonalRow,
      hotelRow,
      hotelTransportRow,
    ];
  }

  function createExcelDataVermietung(vermietung: Vermietung): SimpleExcelRow[] {
    const kosten = vermietung.kosten;

    const titelZeile = { Art: vermietung.kopf.titel + " - " + vermietung.startDatumUhrzeit.mitUhrzeitNumerisch };

    // Einnahmen
    const saalmieteRow = {
      Art: "Saalmiete",
      Einnahme: vermietung.saalmiete ?? 0,
      Ausgabe: "",
    };

    // Ausgaben
    const gagenRow = { Art: "Gagen", Einnahme: "", Ausgabe: kosten.gagenTotalEUR ?? 0 };
    const backlineRockshopRow = { Art: "Backline Rockshop", Einnahme: "", Ausgabe: kosten.backlineEUR ?? 0 };
    const technikZumietungRow = { Art: "Technik Zumietung", Einnahme: "", Ausgabe: kosten.technikAngebot1EUR ?? 0 };
    const fluegelStimmerRow = {
      Art: "Flügelstimmer",
      Einnahme: "",
      Ausgabe: kosten.fluegelstimmerEUR || klavierStimmerStandard,
    };
    const werbung1Row = { Art: kosten.werbung1Label, Einnahme: "", Ausgabe: kosten.werbung1 ?? 0 };
    const werbung2Row = { Art: kosten.werbung2Label, Einnahme: "", Ausgabe: kosten.werbung2 ?? 0 };
    const werbung3Row = { Art: kosten.werbung3Label, Einnahme: "", Ausgabe: kosten.werbung3 ?? 0 };
    const personalRow = { Art: "Personal (unbar)", Einnahme: "", Ausgabe: kosten.personal ?? 0 };

    return [
      titelZeile,
      saalmieteRow,
      gagenRow,
      backlineRockshopRow,
      technikZumietungRow,
      fluegelStimmerRow,
      werbung1Row,
      werbung2Row,
      werbung3Row,
      personalRow,
    ];
  }
}
