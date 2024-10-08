import { beforeEach, describe, expect, it } from "vitest";
import Staff from "../../veranstaltung/staff.js";

describe("Staff", () => {
  let staff: Staff;
  beforeEach(() => {
    staff = new Staff({
      techniker: [],
      technikerV: [],
      merchandise: [],
      kasse: [],
      kasseV: [],
      mod: [],
      technikerNotNeeded: false,
      technikerVNotNeeded: false,
      kasseNotNeeded: false,
      kasseVNotNeeded: false,
      modNotNeeded: false,
      merchandiseNotNeeded: false,
    });
  });

  describe("gibt alle als Array zurück", () => {
    it("wenn nur Kasse", () => {
      staff.kasse = ["Peter"];
      staff.kasseV = ["Paul"];
      expect(staff.allNames).to.include("Peter");
      expect(staff.allNames).to.include("Paul");
    });

    it("wenn mehrere an Kasse", () => {
      staff.kasse = ["Peter", "Paul"];
      expect(staff.allNames).to.include("Peter");
      expect(staff.allNames).to.include("Paul");
    });

    it("Kasse und Technik und MoD", () => {
      staff.kasse = ["Peter", "Paul"];
      staff.techniker = ["Anne", "Gret"];
      staff.mod = ["Nikki"];
      expect(staff.allNames).to.include("Peter");
      expect(staff.allNames).to.include("Paul");
      expect(staff.allNames).to.include("Anne");
      expect(staff.allNames).to.include("Gret");
      expect(staff.allNames).to.include("Nikki");
    });
  });

  describe("kann sagen, ob jemand für die Kasse fehlt", () => {
    it("initial", () => {
      expect(staff.kasseFehlt).toBeTruthy();
    });

    it("wenn nur einer gebraucht wird", () => {
      staff.kasseVNotNeeded = true;
      expect(staff.kasseFehlt).toBeTruthy();

      staff.kasseNotNeeded = true;
      staff.kasseVNotNeeded = false;
      expect(staff.kasseFehlt).toBeTruthy();
    });

    it("wenn nur einer fehlt", () => {
      staff.kasse.push("Peter");
      expect(staff.kasseFehlt).toBeTruthy();
    });

    it("wenn beide da sind", () => {
      staff.kasse.push("Peter");
      staff.kasseV.push("Peter");
      expect(staff.kasseFehlt).toBeFalsy();
    });

    it("normal gebraucht, einer da", () => {
      staff.kasse.push("Peter");
      staff.kasseVNotNeeded = true;
      expect(staff.kasseFehlt).toBeFalsy();
    });

    it("verantwortlich gebraucht, einer da", () => {
      staff.kasseV.push("Peter");
      staff.kasseNotNeeded = true;
      expect(staff.kasseFehlt).toBeFalsy();
    });
  });
});
