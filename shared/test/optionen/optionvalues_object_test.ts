import { expect } from "chai";
import OptionValues from "../../optionen/optionValues.js";

describe("OptionValues constructor sorts lists case insensitive", () => {
  it("typen", () => {
    const result = new OptionValues({ typen: ["Zappa", "Anne", "peter"] });
    expect(result.typen).to.eql(["Anne", "peter", "Zappa"]);
  });
});
