import { expect } from "chai";
import fieldHelpers from "../../commons/fieldHelpers.js";

describe("formatNumberWithCurrentLocale", () => {
  it('formats for "de"', () => {
    const result = fieldHelpers.formatNumberTwoDigits(22);
    expect(result).to.eql("22,00");
  });
});
