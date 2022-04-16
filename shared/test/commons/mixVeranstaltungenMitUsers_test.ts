import { expect } from "chai";
import mixVeranstaltungenMitUsers from "../../commons/mixVeranstaltungenMitUsers";
import Veranstaltung from "../../veranstaltung/veranstaltung";
import User from "../../user/user";

describe("mixVeranstaltungenMitUsers mixes correctly", () => {
  const vveranstaltungNoStaff = new Veranstaltung({});
  const veranstaltung1 = new Veranstaltung({ staff: { kasse: ["Peter"] } });
  const veranstaltung2 = new Veranstaltung({ staff: { kasse: ["Paul"] } });
  const veranstaltung3 = new Veranstaltung({ staff: { kasse: ["Peter", "Paul"] } });

  const peter = new User({ id: "Peter", wantsEmailReminders: true });
  const paul = new User({ id: "Peter" });

  it("if users are empty", () => {
    const result = mixVeranstaltungenMitUsers([veranstaltung1], []);
    expect(result).to.eql([]);
  });

  it("if veranstaltung has no staff", () => {
    const result = mixVeranstaltungenMitUsers([vveranstaltungNoStaff], [peter]);
    expect(result).to.eql([]);
  });

  it("if one staff is valid", () => {
    const result = mixVeranstaltungenMitUsers([veranstaltung1], [peter]);
    expect(result).to.eql([{ veranstaltung: veranstaltung1, user: peter }]);
  });

  it("if one staff is not valid", () => {
    const result = mixVeranstaltungenMitUsers([veranstaltung2], [paul]);
    expect(result).to.eql([]);
  });

  it("if one staff is valid and the other is not valid", () => {
    const result = mixVeranstaltungenMitUsers([veranstaltung3], [peter, paul]);
    expect(result).to.eql([{ veranstaltung: veranstaltung3, user: peter }]);
  });

  it("altogether mix", () => {
    const result = mixVeranstaltungenMitUsers([veranstaltung1, veranstaltung2, veranstaltung3, vveranstaltungNoStaff], [peter, paul]);
    expect(result).to.eql([
      { veranstaltung: veranstaltung1, user: peter },
      { veranstaltung: veranstaltung3, user: peter },
    ]);
  });
});
