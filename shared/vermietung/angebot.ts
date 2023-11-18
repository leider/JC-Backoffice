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

  toJSON(): any {
    return Object.assign({}, this);
  }

  constructor(object?: any) {
    Object.assign(this, object);
  }
  get saalmieteTotal(): number {
    const miete = this.saalmiete;
    const rabatt = (miete * this.saalmieteRabatt) / 100;
    return miete - rabatt;
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
