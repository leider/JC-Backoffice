import { Preisprofil } from "../../optionen/optionValues";

export interface EintrittspreiseRaw {
  preisprofil: Preisprofil;
  regulaer: number;
  rabattErmaessigt: number;
  rabattMitglied: number;
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
  state: EintrittspreiseRaw;

  toJSON(): EintrittspreiseRaw {
    return this.state;
  }

  constructor(object: EintrittspreiseRaw | undefined) {
    this.state = object || {
      preisprofil: {
        name: "Freier Eintritt",
        regulaer: 0,
        rabattErmaessigt: 0,
        rabattMitglied: 0
      },
      regulaer: 0,
      rabattErmaessigt: 0,
      rabattMitglied: 0,
      erwarteteBesucher: 0,
      zuschuss: 0
    };
  }

  fillFromUI(object: EintrittspreiseUI): Eintrittspreise {
    if (object.preisprofil) {
      this.state.preisprofil = JSON.parse(object.preisprofil);
      if (this.state.preisprofil.name !== "Individuell (Alt)") {
        this.state.regulaer = this.preisprofil().regulaer;
        this.state.rabattErmaessigt = this.preisprofil().rabattErmaessigt;
        this.state.rabattMitglied = this.preisprofil().rabattMitglied;
      }
    }
    this.state.erwarteteBesucher = parseInt(object.erwarteteBesucher || "") || 0;
    this.state.zuschuss = parseFloat(object.zuschuss || "") || 0;
    return this;
  }

  standardRabattErmaessigt(): number {
    return 2;
  }

  standardRabattMitglied(): number {
    return 5;
  }

  frei(): boolean {
    return this.state.preisprofil ? this.preisprofil().regulaer === 0 : !!this.state.frei;
  }

  istKooperation(): boolean {
    return this.state.preisprofil && this.preisprofil().name === "Kooperation";
  }

  legacyPreisprofil(): Preisprofil {
    return this.state.frei
      ? {
          name: "Freier Eintritt",
          regulaer: 0,
          rabattErmaessigt: 0,
          rabattMitglied: 0
        }
      : {
          name: "Individuell (Alt)",
          regulaer: this.state.regulaer,
          rabattErmaessigt: this.state.rabattErmaessigt,
          rabattMitglied: this.state.rabattMitglied
        };
  }

  preisprofil(): Preisprofil {
    return this.state.preisprofil || this.legacyPreisprofil();
  }

  regulaer(): number {
    return this.state.regulaer;
  }

  rabattErmaessigt(): number {
    return this.state.rabattErmaessigt || this.standardRabattErmaessigt();
  }

  rabattMitglied(): number {
    return this.state.rabattMitglied || this.standardRabattMitglied();
  }

  ermaessigt(): number {
    return this.regulaer() - Math.abs(this.rabattErmaessigt());
  }

  erwarteteBesucher(): number {
    return this.state.erwarteteBesucher;
  }

  mitglied(): number {
    return this.regulaer() - Math.abs(this.rabattMitglied());
  }

  zuschuss(): number {
    return this.state.zuschuss;
  }

  alsPressetext(kooperationspartner: string): string {
    return this.istKooperation()
      ? `Gemäß Kooperationspartner (${kooperationspartner})`
      : this.frei()
      ? "freier Eintritt"
      : `${this.regulaer()},- (Ermässigt: ${this.ermaessigt()},-, Mitglieder: ${this.mitglied()},-) €`;
  }
}
