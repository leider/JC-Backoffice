import Veranstaltung from "../veranstaltung/veranstaltung.js";
import VeranstaltungKalkulation from "../veranstaltung/veranstaltungKalkulation.js";

export function createExcelData(veranstaltung: Veranstaltung) {
  const kasse = veranstaltung.kasse;

  // Einnahmen
  const eintrittRow = {
    Art: `Eintritt (${kasse.istFreigegeben ? "" : "nicht "}freigegeben)`,
    Einnahme: kasse.einnahmeTicketsEUR,
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
  const backlineRockshopRow = { Art: "Backline Rockshop", Einnahme: "", Ausgabe: kosten.backlineEUR };
  const technikZumietungRow = { Art: "Technik Zumietung", Einnahme: "", Ausgabe: kosten.technikAngebot1EUR };
  const saalmieteRow = { Art: "Saalmiete", Einnahme: "", Ausgabe: kosten.saalmiete };
  const werbung1Row = { Art: "Werbung 1", Einnahme: "", Ausgabe: kosten.werbung1 };
  const werbung2Row = { Art: "Werbung 2", Einnahme: "", Ausgabe: kosten.werbung2 };
  const werbung3Row = { Art: "Werbung 3", Einnahme: "", Ausgabe: kosten.werbung3 };
  const personalRow = { Art: "Personal (unbar)", Einnahme: "", Ausgabe: kosten.personal };
  const hotelRow = { Art: "Hotel", Einnahme: "", Ausgabe: veranstaltung.unterkunft.kostenTotalEUR };

  return [
    eintrittRow,
    barEinnahmenRow,
    barEinlageRow,
    zuschussRow,
    barAusgabenRow,
    barAnBankRow,
    gagenRow,
    backlineRockshopRow,
    technikZumietungRow,
    saalmieteRow,
    werbung1Row,
    werbung2Row,
    werbung3Row,
    personalRow,
    hotelRow,
  ];
}
