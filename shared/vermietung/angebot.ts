import renderer from "../commons/renderer.js";

export type AngebotStatus = "offen" | "verschickt" | "angenommen" | "abgerechnet";

export default class Angebot {
  saalmiete = 0;
  saalmieteRabatt = 0;
  tontechnikerAnzahl = 1;
  tontechnikerBetrag = 0;
  lichttechnikerAnzahl = 1;
  lichttechnikerBetrag = 0;
  musikerAnzahl = 1;
  musikerGage = 0;
  reinigungHaus = 0;
  barpersonalAnzahl = 1;
  barpersonalBetrag = 0;
  reinigungBar = 0;
  fluegel = 0;
  status: AngebotStatus = "offen";
  beschreibung = "";

  toJSON(): any {
    return Object.assign({}, this);
  }

  constructor(object?: any) {
    Object.assign(this, object);
  }
  get saalmieteTotal(): number {
    return this.saalmiete + this.saalmieteRabattEUR;
  }
  get saalmieteRabattEUR(): number {
    return -((this.saalmiete * this.saalmieteRabatt) / 100);
  }
  get tontechnikerTotal(): number {
    return this.tontechnikerAnzahl * this.tontechnikerBetrag;
  }
  get lichttechnikerTotal(): number {
    return this.lichttechnikerAnzahl * this.lichttechnikerBetrag;
  }
  get musikerTotal(): number {
    return this.musikerAnzahl * this.musikerGage;
  }
  get barpersonalTotal(): number {
    return this.barpersonalAnzahl * this.barpersonalBetrag;
  }

  get renderedBeschreibung(): string {
    return renderer.render(this.beschreibung || "");
  }
  get summe(): number {
    return (
      this.saalmieteTotal +
      this.tontechnikerTotal +
      this.lichttechnikerTotal +
      this.musikerTotal +
      this.barpersonalTotal +
      this.reinigungHaus +
      this.reinigungBar +
      this.fluegel
    );
  }
}
