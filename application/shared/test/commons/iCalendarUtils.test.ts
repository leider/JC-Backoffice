import { describe, expect, it } from "vitest";
import { parseIcal } from "../../commons/iCalendarUtils.js";
import * as fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import * as path from "node:path";
import * as superagent from "superagent";
const __dirname = dirname(fileURLToPath(import.meta.url));

describe("iCalendarUtils.parseIcal", () => {
  it("Handles weird iCals for BaWü", () => {
    const text = fs.readFileSync(path.join(__dirname, "bawue2022.ical"), { encoding: "utf-8" });
    const result = parseIcal(text);
    expect(result.events?.length).to.eql(8);
  });

  it("Handles weird iCals for BaWü live", async () => {
    const resp = await superagent.get("https://www.ferienwiki.de/exports/ferien/2022/de/baden-wuerttemberg");
    const text = resp.text;
    const result = parseIcal(text);
    expect(result.events?.length).to.eql(8);
  });
});
