import Kopf from "../veranstaltung/kopf.js";
import Angebot from "./angebot.js";
import Kontakt from "../veranstaltung/kontakt.js";
import Veranstaltung, { MinimalVeranstaltung } from "../veranstaltung/veranstaltung.js";

export default class Vermietung extends Veranstaltung {
  saalmiete? = undefined;
  brauchtTechnik = false;
  brauchtPresse = false;
  brauchtBar = false;
  art: "Angebot" | "Vertrag" | "Rechnung" = "Angebot";

  angebot = new Angebot();
  vertragspartner = new Kontakt();

  toJSON(): object {
    const result = {};
    Object.assign(result, this, {
      artist: this.artist.toJSON(),
      kopf: this.kopf.toJSON(),
      kosten: this.kosten.toJSON(),
      presse: this.presse.toJSON(),
      staff: this.staff.toJSON(),
      technik: this.technik.toJSON(),
      angebot: this.angebot.toJSON(),
      vertragspartner: this.vertragspartner.toJSON(),
    });
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(object?: any) {
    super(object);
    if (object) {
      Object.assign(this, {
        angebot: new Angebot(object.angebot),
        kopf: new Kopf(object.kopf),
        vertragspartner: new Kontakt(object.vertragspartner),
        saalmiete: object.saalmiete,
        brauchtTechnik: object.brauchtTechnik,
        brauchtPresse: object.brauchtPresse,
        brauchtBar: object.brauchtBar,
        art: object.art,
      });
    }
  }

  asNew(object: MinimalVeranstaltung) {
    return new Vermietung(object);
  }

  get isVermietung(): boolean {
    return true;
  }

  reset(): void {
    super.reset();
  }

  get brauchtPersonal() {
    return !this.staff.noStaffNeeded;
  }
}
