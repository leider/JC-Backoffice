import Konzert from "./konzert.js";

export default class KonzertKalkulation {
  private veranstaltung: Konzert;

  constructor(veranstaltung: Konzert) {
    this.veranstaltung = veranstaltung;
  }

  private get kasse() {
    return this.veranstaltung.kasse;
  }

  private get kosten() {
    return this.veranstaltung.kosten;
  }

  private get unterkunft() {
    return this.veranstaltung.unterkunft;
  }

  private get eintrittspreise() {
    return this.veranstaltung.eintrittspreise;
  }

  get kostenGesamtEUR(): number {
    const hotelkosten = this.veranstaltung.artist.brauchtHotel ? this.unterkunft.kostenTotalEUR : 0;
    return this.kosten.totalEUR + hotelkosten + this.kasse.ausgabenOhneGage;
  }
  get erwarteterOderEchterEintritt(): number {
    return (
      (this.kasse.istFreigegeben ? this.kasse.einnahmeTicketsEUR : this.eintrittspreise.erwarteterEintritt) + this.kasse.einnahmenReservix
    );
  }

  get einnahmenGesamtEUR(): number {
    return this.erwarteterOderEchterEintritt;
  }

  get dealAbsolutEUR(): number {
    return Math.max(this.bruttoUeberschussEUR * this.kosten.dealAlsFaktor, 0);
  }

  get bruttoUeberschussEUR(): number {
    return this.einnahmenGesamtEUR - this.kostenGesamtEUR;
  }

  get dealUeberschussTotal(): number {
    return this.bruttoUeberschussEUR - this.dealAbsolutEUR;
  }
}
