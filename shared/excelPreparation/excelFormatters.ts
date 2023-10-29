import Veranstaltung from "../veranstaltung/veranstaltung.js";
import VeranstaltungKalkulation from "../veranstaltung/veranstaltungKalkulation.js";
import Vermietung from "../vermietung/vermietung";

export function createExcelData(veranstaltung: Veranstaltung) {
  const kasse = veranstaltung.kasse;
  const kalk = new VeranstaltungKalkulation(veranstaltung);
  // Einnahmen
  const eintrittRow = {
    Art: `Eintritt (${kasse.istFreigegeben ? "" : "nicht "}freigegeben)`,
    Einnahme: kasse.einnahmeTicketsEUR,
    Ausgabe: "",
  };
  const reservixRow = {
    Art: "Eintritt Reservix",
    Einnahme: kasse.einnahmenReservix,
    Ausgabe: "",
  };
  const barEinnahmenRow = { Art: "Bar Einnahmen", Einnahme: kasse.einnahmeOhneBankUndTickets, Ausgabe: "" };
  const barEinlageRow = { Art: "Bar Einlage", Einnahme: kasse.einnahmeBankEUR, Ausgabe: "" };
  const zuschussRow = { Art: "Zuschüsse", Einnahme: veranstaltung.eintrittspreise.zuschuss, Ausgabe: "" };
  // Ausgaben
  const barAusgabenRow = { Art: "Barausgaben", Einnahme: "", Ausgabe: kasse.ausgabenOhneGage };
  const barAnBankRow = { Art: "Bar an Bank", Einnahme: "", Ausgabe: kasse.ausgabeBankEUR };

  const kosten = veranstaltung.kosten;
  const gagenRow = { Art: "Gagen", Einnahme: "", Ausgabe: kosten.gagenTotalEUR };
  const dealRow = { Art: "Gagen (Deal)", Einnahme: "", Ausgabe: kalk.dealAbsolutEUR };
  const provisionRow = { Art: "Provision Agentur", Einnahme: "", Ausgabe: kosten.provisionAgentur };
  const backlineRockshopRow = { Art: "Backline Rockshop", Einnahme: "", Ausgabe: kosten.backlineEUR };
  const technikZumietungRow = { Art: "Technik Zumietung", Einnahme: "", Ausgabe: kosten.technikAngebot1EUR };
  const fluegelStimmerRow = { Art: "Flügelstimmer", Einnahme: "", Ausgabe: kosten.fluegelstimmerEUR };
  const saalmieteRow = { Art: "Saalmiete", Einnahme: "", Ausgabe: kosten.saalmiete };
  const werbung1Row = { Art: kosten.werbung1Label, Einnahme: "", Ausgabe: kosten.werbung1 };
  const werbung2Row = { Art: kosten.werbung2Label, Einnahme: "", Ausgabe: kosten.werbung2 };
  const werbung3Row = { Art: kosten.werbung3Label, Einnahme: "", Ausgabe: kosten.werbung3 };
  const personalRow = { Art: "Personal (unbar)", Einnahme: "", Ausgabe: kosten.personal };
  const hotelRow = { Art: "Hotel", Einnahme: "", Ausgabe: veranstaltung.unterkunft.roomsTotalEUR };
  const hotelTransportRow = { Art: "Hotel (Transport)", Einnahme: "", Ausgabe: veranstaltung.unterkunft.transportEUR };

  return [
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
    hotelRow,
    hotelTransportRow,
  ];
}
export function createExcelDataVermietung(vermietung: Vermietung) {
  // Einnahmen
  const saalmieteRow = {
    Art: "Saalmiete",
    Einnahme: vermietung.saalmiete,
    Ausgabe: "",
  };
  // Ausgaben

  const kosten = vermietung.kosten;
  const gagenRow = { Art: "Gagen", Einnahme: "", Ausgabe: kosten.gagenTotalEUR };
  const backlineRockshopRow = { Art: "Backline Rockshop", Einnahme: "", Ausgabe: kosten.backlineEUR };
  const technikZumietungRow = { Art: "Technik Zumietung", Einnahme: "", Ausgabe: kosten.technikAngebot1EUR };
  const fluegelStimmerRow = { Art: "Flügelstimmer", Einnahme: "", Ausgabe: kosten.fluegelstimmerEUR };
  const werbung1Row = { Art: kosten.werbung1Label, Einnahme: "", Ausgabe: kosten.werbung1 };
  const werbung2Row = { Art: kosten.werbung2Label, Einnahme: "", Ausgabe: kosten.werbung2 };
  const werbung3Row = { Art: kosten.werbung3Label, Einnahme: "", Ausgabe: kosten.werbung3 };
  const personalRow = { Art: "Personal (unbar)", Einnahme: "", Ausgabe: kosten.personal };

  return [
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
