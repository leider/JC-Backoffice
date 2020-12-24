import { expect } from "chai";
import Orte from "../../optionen/orte";

const emptyOrte = { orte: [] };

describe("Orte", () => {
  it("is properly initialized", () => {
    const orte = new Orte(emptyOrte);
    expect(orte.orte).to.eql([]);
  });

  it("sorts by name in constructor", () => {
    const peter = { name: "peter", flaeche: "20" };
    const zappa = { name: "Zappa", flaeche: "20" };
    const anna = { name: "anna", flaeche: "20" };
    const orte = new Orte({
      orte: [peter, zappa, anna],
    });
    expect((orte.toJSON() as any).orte).to.eql([anna, peter, zappa]);
  });
});
