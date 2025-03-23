import Kopf from "../veranstaltung/kopf.js";
import Angebot from "./angebot.js";
import Kontakt from "../veranstaltung/kontakt.js";
import Veranstaltung, { MinimalVeranstaltung } from "../veranstaltung/veranstaltung.js";
import { RecursivePartial } from "../commons/advancedTypes.js";

export default class Vermietung extends Veranstaltung {
  saalmiete? = undefined;
  brauchtTechnik = false;
  brauchtBar = false;
  art: "Angebot" | "Vertrag" | "Rechnung" = "Angebot";

  angebot = new Angebot();
  vertragspartner = new Kontakt();

  constructor(object?: RecursivePartial<Omit<Vermietung, "startDate" | "endDate"> & { startDate: string | Date; endDate: string | Date }>) {
    super(object ?? { brauchtPresse: false });
    if (object) {
      Object.assign(this, {
        angebot: new Angebot(object.angebot as Omit<Angebot, "freigabeAm"> & { freigabeAm?: Date | string }),
        kopf: new Kopf(object.kopf),
        vertragspartner: new Kontakt(object.vertragspartner),
        saalmiete: object.saalmiete,
        brauchtTechnik: object.brauchtTechnik,
        brauchtBar: object.brauchtBar,
        art: object.art,
      });
    }
  }

  asNew(object: MinimalVeranstaltung) {
    return new Vermietung(object);
  }

  // eslint-disable-next-line lodash/prefer-constant
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
