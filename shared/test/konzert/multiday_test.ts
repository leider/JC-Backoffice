import { expect } from "chai";
import Konzert from "../../konzert/konzert.js";

describe("Start und Ende Erweiterungen", () => {
  function expectTage(tage: string[], expected: string[]) {
    const veranst = new Konzert({
      startDate: tage[0],
      endDate: tage[1],
    });
    expect(veranst.tageOhneStart.map((day) => day.tagMonatJahrKompakt)).to.deep.equal(expected);
  }

  it("Ist einen Tag lang", () => {
    expectTage(["2024-02-01", "2024-02-01"], []);
  });

  it("Ist zwei Tag lang", () => {
    expectTage(["2024-02-01", "2024-02-02"], ["02.02.2024"]);
  });

  it("Ist zwei Tag lang mit Uhrzeit", () => {
    expectTage(["2024-02-01T19:00:21.471Z", "2024-02-02T23:59:21.471Z"], ["02.02.2024"]);
  });

  it("Ist zwei Wochen lang", () => {
    expectTage(
      ["2024-02-01", "2024-02-14"],
      [
        "02.02.2024",
        "03.02.2024",
        "04.02.2024",
        "05.02.2024",
        "06.02.2024",
        "07.02.2024",
        "08.02.2024",
        "09.02.2024",
        "10.02.2024",
        "11.02.2024",
        "12.02.2024",
        "13.02.2024",
        "14.02.2024",
      ],
    );
  });
});
