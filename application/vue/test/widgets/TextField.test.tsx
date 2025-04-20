import { waitFor } from "@testing-library/react";
import { formWidgetHelper } from "../util/testHelpers";
import { TextField } from "@/widgets/TextField.tsx";
import { beforeEach, describe, expect, it } from "vitest";

const { widget, updateWidget, form } = formWidgetHelper;

describe("Simple (Text) Input Widget", () => {
  describe("renders values when only standard properties are set as", () => {
    beforeEach(async () => {
      await waitFor(() => {
        updateWidget(<TextField label="testme" name="test" />);
      });
    });

    it("initially undefined if no form value", () => {
      expect(form().getFieldValue("test")).toBe(undefined);
    });

    it("initially 'text' when form value is 'text'", async () => {
      await waitFor(() => form().setFieldsValue({ test: "text" }));
      expect(form().getFieldValue("test")).toBe("text");
    });

    it("'text' if set manually", async () => {
      widget().setValueOnInputLabeled("testme", "text");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe("text");
      });
    });
  });

  describe("renders explicitly with initialValue as", () => {
    beforeEach(() => {
      updateWidget(<TextField initialValue="initial" label="testme" name="test" />);
    });

    it("untouched if not set by form", () => {
      expect(form().getFieldValue("test")).toBe("initial");
    });

    it("overruled by form", async () => {
      await waitFor(() => form().setFieldsValue({ test: "later" }));
      expect(form().getFieldValue("test")).toBe("later");
    });
  });

  describe("renders disabled", () => {
    beforeEach(() => {
      updateWidget(<TextField disabled label="testme" name="test" />);
    });

    it("NOT prohibiting programmatic value changes", async () => {
      await waitFor(() => form().setFieldsValue({ test: "text" }));
      widget().setValueOnInputLabeled("testme", "later");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe("later");
      });
    });
  });

  describe("executes callback on value change", () => {
    let tunnelVal: string | null;
    beforeEach(() => {
      // eslint-disable-next-line react/jsx-no-bind
      updateWidget(<TextField label="testme" name="test" onChange={(val) => (tunnelVal = val)} />);
    });

    it("but not on initial rendering", async () => {
      await waitFor(() => form().setFieldsValue({ test: "text" }));
      expect(tunnelVal).toBe(undefined);
    });

    it("when changed", async () => {
      widget().setValueOnInputLabeled("testme", "text");
      await waitFor(() => {
        expect(tunnelVal).toBe("text");
      });
      widget().setValueOnInputLabeled("testme", "later");
      await waitFor(() => {
        expect(tunnelVal).toBe("later");
      });
    });
  });
});
