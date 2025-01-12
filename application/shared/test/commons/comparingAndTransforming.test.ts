import { describe, expect, it, vi } from "vitest";
import { logDiffForDirty, withoutNullOrUndefinedStrippedBy } from "../../commons/comparingAndTransforming.js";

describe("comparingAndTransforming", () => {
  describe("withoutNullOrUndefinedStrippedBy", () => {
    it("Should return true if there is no value", () => {
      const result = withoutNullOrUndefinedStrippedBy({});
      expect(result).to.eql({});
    });

    it("strips simple properties", () => {
      const result = withoutNullOrUndefinedStrippedBy({ toBeStripped: "Peter" }, ["toBeStripped"]);
      expect(result).to.eql({});
    });

    it("strips simple nested properties", () => {
      const result = withoutNullOrUndefinedStrippedBy({ inside: { someOther: 123, toBeStripped: "Peter" } }, ["inside.toBeStripped"]);
      expect(result).to.eql({ inside: { someOther: 123 } });
    });

    it("strips deeply nested properties", () => {
      const result = withoutNullOrUndefinedStrippedBy(
        {
          outside: {
            some: "text",
            toBeStripped: "Peter",
            inside: {
              someOther: 123,
              toBeStripped: "Peter",
            },
          },
        },
        ["outside.inside.toBeStripped"],
      );
      expect(result).to.eql({
        outside: {
          inside: {
            someOther: 123,
          },
          some: "text",
          toBeStripped: "Peter",
        },
      });
    });

    it("handles 'incomplete' objects", () => {
      const result = withoutNullOrUndefinedStrippedBy({}, ["inside.toBeStripped"]);
      expect(result).to.eql({});
    });
  });

  describe("logDiffForDirty", () => {
    const Mocksole = { log: vi.fn() };
    vi.stubGlobal("console", Mocksole);

    it("Should log only if enabled", () => {
      logDiffForDirty({}, {}, true);
      logDiffForDirty({}, {}, false);
      // eslint-disable-next-line no-console
      expect(console.log).toBeCalledTimes(1);
    });
  });
});
