import fieldHelpers from "../../commons/fieldHelpers";

function floatAmount(textWithNumberOrNull?: string | null): number {
  return parseFloat(textWithNumberOrNull || "") || 0;
}

const steuerSaetze = ["ohne", "7% MWSt.", "19% MWSt.", "18,8% Ausland"];
const deals = ["ohne", "100%", "90%", "80%", "70%", "60%"];

export interface KostenRaw {
  backlineEUR: number;
  saalmiete: number;
  technikAngebot1EUR: number;
  gagenEUR: number;
  werbung1: number;
  werbung2: number;
  werbung3: number;
  personal: number;
  gagenSteuer: string | null;
  deal: string | null;
  gageBAR: boolean;
}

export interface KostenUI {
  backlineEUR?: string;
  saalmiete?: string;
  technikAngebot1EUR?: string;
  gagenEUR?: string;
  werbung1?: string;
  werbung2?: string;
  werbung3?: string;
  personal?: string;
  gagenSteuer?: string | null;
  deal?: string | null;
  gageBAR?: string;
}

export default class Kosten {
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

  toJSON(): KostenRaw {
    return this;
  }

  constructor(object?: KostenRaw) {
    if (object && Object.keys(object).length !== 0) {
      this.backlineEUR = object.backlineEUR;
      this.saalmiete = object.saalmiete;
      this.technikAngebot1EUR = object.technikAngebot1EUR;
      this.gagenEUR = object.gagenEUR;
      this.werbung1 = object.werbung1;
      this.werbung2 = object.werbung2;
      this.werbung3 = object.werbung3;
      this.personal = object.personal;
      this.gagenSteuer = object.gagenSteuer;
      this.deal = object.deal;
      this.gageBAR = object.gageBAR;
    }
  }

  fillFromUI(object: KostenUI): Kosten {
    this.backlineEUR = floatAmount(object.backlineEUR);
    this.saalmiete = floatAmount(object.saalmiete);
    this.technikAngebot1EUR = floatAmount(object.technikAngebot1EUR);
    this.gagenEUR = floatAmount(object.gagenEUR);
    this.werbung1 = floatAmount(object.werbung1);
    this.werbung2 = floatAmount(object.werbung2);
    this.werbung3 = floatAmount(object.werbung3);
    this.personal = floatAmount(object.personal);
    this.gagenSteuer = object.gagenSteuer || this.gagenSteuer;
    this.deal = object.deal || this.deal;
    this.gageBAR = !!object.gageBAR;
    return this;
  }

  gagenTotalEUR(): number {
    const eur = this.gagenEUR;
    const mwst = (eur * floatAmount(this.gagenSteuer)) / 100;
    return eur + mwst;
  }

  gagenTotalEURformatted(): string {
    return fieldHelpers.formatNumberTwoDigits(this.gagenTotalEUR());
  }

  dealAlsFaktor(): number {
    return floatAmount(this.deal) / 100;
  }

  backlineUndTechnikEUR(): number {
    return this.backlineEUR + this.technikAngebot1EUR;
  }

  totalEUR(): number {
    return (
      this.gagenTotalEUR() + this.backlineUndTechnikEUR() + this.saalmiete + this.werbung1 + this.werbung2 + this.werbung3 + this.personal
    );
  }

  steuerSatze(): string[] {
    return steuerSaetze;
  }

  deals(): string[] {
    return deals;
  }
}
