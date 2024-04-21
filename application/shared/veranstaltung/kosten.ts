function floatAmount(textWithNumberOrNull?: string | null): number {
  return parseFloat(textWithNumberOrNull || "") || 0;
}

function formatNumberTwoDigits(number: string | number): string {
  if (typeof number === "string") {
    return number;
  }
  if (number !== 0 && !number) {
    return "";
  }
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  }).format(number || 0);
}

export default class Kosten {
  static deals = ["ohne", "100%", "90%", "80%", "70%", "60%"];

  backlineEUR = 0;
  saalmiete = 0;
  technikAngebot1EUR = 0;
  fluegelstimmerEUR = 0;
  gagenEUR = 0;
  provisionAgentur = 0;
  werbung1 = 0;
  werbung2 = 0;
  werbung3 = 0;
  werbung1Label = "Werbung 1";
  werbung2Label = "Werbung 2";
  werbung3Label = "Werbung 3";
  personal = 0;
  gagenSteuer: string | null = null;
  deal: string | null = null;
  gageBAR = false;
  cateringMusiker = 0;
  cateringPersonal = 0;
  tontechniker = 0;
  lichttechniker = 0;

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  toJSON(): any {
    return Object.assign({}, this);
  }

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
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
    return formatNumberTwoDigits(this.gagenTotalEUR);
  }

  get dealAlsFaktor(): number {
    return floatAmount(this.deal) / 100;
  }

  get backlineUndTechnikEUR(): number {
    return this.backlineEUR + this.technikAngebot1EUR + this.fluegelstimmerEUR;
  }

  get totalEUR(): number {
    return (
      this.gagenTotalEUR +
      this.provisionAgentur +
      this.backlineUndTechnikEUR +
      this.saalmiete +
      this.werbung1 +
      this.werbung2 +
      this.werbung3 +
      this.personal +
      this.cateringPersonal +
      this.cateringMusiker +
      this.tontechniker +
      this.lichttechniker
    );
  }
}
