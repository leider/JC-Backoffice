import { Preisprofil } from "../../optionen/optionValues";

export interface EintrittspreiseRaw {
  preisprofil?: Preisprofil;
  regulaer?: number;
  rabattErmaessigt?: number;
  rabattMitglied?: number;
  erwarteteBesucher: number;
  zuschuss: number;
  frei?: boolean;
}

export interface EintrittspreiseUI {
  preisprofil: string;
  erwarteteBesucher?: string;
  zuschuss?: string;
}

export default class Eintrittspreise {
  preisprofil = {
    name: "Freier Eintritt",
    regulaer: 0,
    rabattErmaessigt: 0,
    rabattMitglied: 0
  };
  erwarteteBesucher = 0;
  zuschuss = 0;

  toJSON(): Eintrittspreise {
    return this;
  }

  constructor(object?: EintrittspreiseRaw) {
    if (object) {
      if (!object.preisprofil) {
        this.preisprofil = object.frei
          ? {
              name: "Freier Eintritt",
              regulaer: 0,
              rabattErmaessigt: 0,
              rabattMitglied: 0
            }
          : {
              name: "Individuell (Alt)",
              regulaer: object.regulaer || 0,
              rabattErmaessigt: object.rabattErmaessigt || 0,
              rabattMitglied: object.rabattMitglied || 0
            };
      } else {
        this.preisprofil = object.preisprofil;
        this.erwarteteBesucher = object.erwarteteBesucher;
        this.zuschuss = object.zuschuss;
      }
    }
  }

  fillFromUI(object: EintrittspreiseUI): Eintrittspreise {
    if (object.preisprofil) {
      this.preisprofil = JSON.parse(object.preisprofil);
    }
    this.erwarteteBesucher = parseInt(object.erwarteteBesucher || "") || 0;
    this.zuschuss = parseFloat(object.zuschuss || "") || 0;
    return this;
  }

  standardRabattErmaessigt(): number {
    return 2;
  }

  standardRabattMitglied(): number {
    return 5;
  }

  frei(): boolean {
    return this.preisprofil.regulaer === 0;
  }

  istKooperation(): boolean {
    return this.preisprofil.name === "Kooperation";
  }

  regulaer(): number {
    return this.preisprofil.regulaer;
  }

  rabattErmaessigt(): number {
    return this.preisprofil.rabattErmaessigt || this.standardRabattErmaessigt();
  }

  rabattMitglied(): number {
    return this.preisprofil.rabattMitglied || this.standardRabattMitglied();
  }

  ermaessigt(): number {
    return this.regulaer() - Math.abs(this.rabattErmaessigt());
  }

  mitglied(): number {
    return this.regulaer() - Math.abs(this.rabattMitglied());
  }

  alsPressetext(kooperationspartner: string): string {
    return this.istKooperation()
      ? `Gemäß Kooperationspartner (${kooperationspartner})`
      : this.frei()
      ? "freier Eintritt"
      : `${this.regulaer()},- (Ermässigt: ${this.ermaessigt()},-, Mitglieder: ${this.mitglied()},-) €`;
  }
}
