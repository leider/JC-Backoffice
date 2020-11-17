import { expect } from "chai";
import Kosten from "../../shared/veranstaltung/kosten";

describe("Kosten", () => {
  it('funktioniert auf allen Methoden auch mit "null" values', () => {
    const kosten = new Kosten({
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
      gageBAR: false,
    });
    expect(kosten.gagenTotalEUR()).to.equal(0);
    expect(kosten.backlineUndTechnikEUR()).to.equal(0);
    expect(kosten.totalEUR()).to.equal(0);

    expect(kosten.dealAlsFaktor()).to.equal(0);
  });
});
