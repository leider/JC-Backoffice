import { describe, expect, it } from "vitest";
import { withoutNullOrUndefinedStrippedBy } from "../../commons/comparingAndTransforming";

describe("comparingAndTransforming.withoutNullOrUndefinedStrippedBy", () => {
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
