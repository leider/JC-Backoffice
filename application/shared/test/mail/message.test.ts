import { describe, expect, it } from "vitest";
import MailMessage from "../../mail/mailMessage.js";

describe("Message 'formatEMailAddress'", () => {
  it("formats addresses correctly for simple name email combination", () => {
    const result = MailMessage.formatEMailAddress("Name", "name@web.de");
    expect(result).eql({ address: "name@web.de", name: "Name" });
  });

  it("formats addresses correctly for multiple name email combinations", () => {
    const result = MailMessage.formatEMailAddressCommaSeparated("Name,Name2", "name@web.de,name2@web.de");
    expect(result).eql([
      { address: "name@web.de", name: "Name" },
      { address: "name2@web.de", name: "Name2" },
    ]);
  });

  it("handles missing name in name email combinations", () => {
    const result = MailMessage.formatEMailAddressCommaSeparated("Name,", "name@web.de,name2@web.de");
    expect(result).eql([
      { address: "name@web.de", name: "Name" },
      { address: "name2@web.de", name: "" },
    ]);
  });
});
