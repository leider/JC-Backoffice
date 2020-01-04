import fieldHelpers from "../../commons/fieldHelpers";

function floatAmount(textWithNumberOrNull?: string | null): number {
  return parseFloat(textWithNumberOrNull || "") || 0;
}

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
  state: KostenRaw;

  toJSON(): KostenRaw {
    return this.state;
  }

  constructor(object: KostenRaw | undefined) {
    this.state = object || {
      backlineEUR: 0,
      saalmiete: 0,
      technikAngebot1EUR: 0,
      gagenEUR: 0,
      werbung1: 0,
      werbung2: 0,
      werbung3: 0,
      personal: 0,
      gagenSteuer: null,
      deal: null,
      gageBAR: false
    };
  }

  fillFromUI(object: KostenUI): Kosten {
    this.state.backlineEUR = floatAmount(object.backlineEUR);
    this.state.saalmiete = floatAmount(object.saalmiete);
    this.state.technikAngebot1EUR = floatAmount(object.technikAngebot1EUR);
    this.state.gagenEUR = floatAmount(object.gagenEUR);
    this.state.werbung1 = floatAmount(object.werbung1);
    this.state.werbung2 = floatAmount(object.werbung2);
    this.state.werbung3 = floatAmount(object.werbung3);
    this.state.personal = floatAmount(object.personal);
    this.state.gagenSteuer = object.gagenSteuer || this.state.gagenSteuer;
    this.state.deal = object.deal || this.state.deal;
    this.state.gageBAR = !!object.gageBAR;
    return this;
  }

  backlineEUR(): number {
    return this.state.backlineEUR;
  }

  saalmiete(): number {
    return this.state.saalmiete;
  }

  technikAngebot1EUR(): number {
    return this.state.technikAngebot1EUR;
  }

  werbung1(): number {
    return this.state.werbung1;
  }

  werbung2(): number {
    return this.state.werbung2;
  }

  werbung3(): number {
    return this.state.werbung3;
  }

  personal(): number {
    return this.state.personal;
  }

  gagenEUR(): number {
    return this.state.gagenEUR;
  }

  gagenSteuer(): string | null {
    return this.state.gagenSteuer;
  }

  gagenTotalEUR(): number {
    const eur = this.gagenEUR();
    const mwst = (eur * floatAmount(this.gagenSteuer())) / 100;
    return eur + mwst;
  }

  gagenTotalEURformatted(): string {
    return fieldHelpers.formatNumberTwoDigits(this.gagenTotalEUR());
  }

  deal(): string | null {
    return this.state.deal;
  }

  dealAlsFaktor(): number {
    return floatAmount(this.deal()) / 100;
  }

  backlineUndTechnikEUR(): number {
    return this.backlineEUR() + this.technikAngebot1EUR();
  }

  totalEUR(): number {
    return (
      this.gagenTotalEUR() +
      this.backlineUndTechnikEUR() +
      this.saalmiete() +
      this.werbung1() +
      this.werbung2() +
      this.werbung3() +
      this.personal()
    );
  }

  gageBAR(): boolean {
    return this.state.gageBAR;
  }
}
