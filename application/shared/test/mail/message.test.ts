import { describe, expect, it } from "vitest";
import Message from "../../mail/message.js";

describe("Message 'formatEMailAddress'", () => {
  it("formats addresses correctly for simple name email combination", () => {
    const result = Message.formatEMailAddress("Name", "name@web.de");
    expect(result).eql(`"Name" <name@web.de>`);
  });

  it("formats addresses correctly for multiple name email combinations", () => {
    const result = Message.formatEMailAddress("Name,Name2", "name@web.de,name2@web.de");
    expect(result).eql(`"Name" <name@web.de>,"Name2" <name2@web.de>`);
  });

  it("handles missing name in name email combinations", () => {
    const result = Message.formatEMailAddress("Name,", "name@web.de,name2@web.de");
    expect(result).eql(`"Name" <name@web.de>,"" <name2@web.de>`);
  });
});
