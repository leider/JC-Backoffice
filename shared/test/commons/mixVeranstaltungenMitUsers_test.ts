import { expect } from "chai";
import mixVeranstaltungenMitUsers from "../../commons/mixVeranstaltungenMitUsers.js";
import Konzert from "../../konzert/konzert.js";
import User from "../../user/user.js";
import Vermietung from "../../vermietung/vermietung.js";

describe("mixKonzertMitUsers mixes correctly", () => {
  const konzertNoStaff = new Konzert({});
  const konzert1 = new Konzert({ staff: { kasse: ["Peter"] } });
  const konzert2 = new Konzert({ staff: { kasse: ["Paul"] } });
  const konzert3 = new Konzert({ staff: { kasse: ["Peter", "Paul"] } });
  const vermietung = new Vermietung({ staff: { techniker: ["Peter", "Paul"] } });

  const peter = new User({ id: "Peter", wantsEmailReminders: true });
  const paul = new User({ id: "Peter" });

  it("if users are empty", () => {
    const result = mixVeranstaltungenMitUsers([konzert1], []);
    expect(result).to.eql([]);
  });

  it("if konzert has no staff", () => {
    const result = mixVeranstaltungenMitUsers([konzertNoStaff], [peter]);
    expect(result).to.eql([]);
  });

  it("if one staff is valid", () => {
    const result = mixVeranstaltungenMitUsers([konzert1], [peter]);
    expect(result).to.eql([{ veranstaltung: konzert1, user: peter }]);
  });

  it("if one staff is not valid", () => {
    const result = mixVeranstaltungenMitUsers([konzert2], [paul]);
    expect(result).to.eql([]);
  });

  it("if one staff is valid and the other is not valid", () => {
    const result = mixVeranstaltungenMitUsers([konzert3], [peter, paul]);
    expect(result).to.eql([{ veranstaltung: konzert3, user: peter }]);
  });

  it("altogether mix", () => {
    const result = mixVeranstaltungenMitUsers([konzert1, konzert2, konzert3, konzertNoStaff], [peter, paul]);
    expect(result).to.eql([
      { veranstaltung: konzert1, user: peter },
      { veranstaltung: konzert3, user: peter },
    ]);
  });

  it("altogether mix with Vermietung", () => {
    const result = mixVeranstaltungenMitUsers([konzert1, konzert2, konzert3, konzertNoStaff, vermietung], [peter, paul]);
    expect(result).to.eql([
      { veranstaltung: konzert1, user: peter },
      { veranstaltung: konzert3, user: peter },
      { veranstaltung: vermietung, user: peter },
    ]);
  });
});
