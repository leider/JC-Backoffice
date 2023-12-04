import { expect } from "chai";
import Orte, { Ort } from "../../optionen/orte.js";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orteJson = (orte.toJSON() as any).orte as Ort[];
    orteJson.forEach((ort) => {
      const keys = Object.keys(ort);
      keys.forEach((key) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (ort[key] === undefined) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          delete ort[key];
        }
      });
    });
    expect(orteJson).to.eql([anna, peter, zappa]);
  });
});
