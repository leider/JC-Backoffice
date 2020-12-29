import fieldHelpers from "../commons/fieldHelpers";

function floatAmount(textWithNumberOrNull?: string | null): number {
  return parseFloat(textWithNumberOrNull || "") || 0;
}

export default class Kosten {
  static deals = ["ohne", "100%", "90%", "80%", "70%", "60%"];

  backlineEUR = 0;
  saalmiete = 0;
  technikAngebot1EUR = 0;
  gagenEUR = 0;
  werbung1 = 0;
  werbung2 = 0;
  werbung3 = 0;
  personal = 0;
  gagenSteuer: string | null = null;
  deal: string | null = null;
  gageBAR = false;

  toJSON(): any {
    return Object.assign({}, this);
  }

  constructor(object?: any) {
    if (object && Object.keys(object).length !== 0) {
      Object.assign(this, object);
      if (!this.gagenSteuer) {
        this.gagenSteuer = "ohne";
      }
    }
  }

  get gagenTotalEUR(): number {
    const eur = this.gagenEUR;
    const mwst = (eur * floatAmount(this.gagenSteuer)) / 100;
    return eur + mwst;
  }

  get gagenTotalEURformatted(): string {
    return fieldHelpers.formatNumberTwoDigits(this.gagenTotalEUR);
  }

  get dealAlsFaktor(): number {
    return floatAmount(this.deal) / 100;
  }

  get backlineUndTechnikEUR(): number {
    return this.backlineEUR + this.technikAngebot1EUR;
  }

  get totalEUR(): number {
    return this.gagenTotalEUR + this.backlineUndTechnikEUR + this.saalmiete + this.werbung1 + this.werbung2 + this.werbung3 + this.personal;
  }
}
