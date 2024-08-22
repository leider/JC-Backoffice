import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { formWidgetHelper } from "../util/testHelpers";
import { NumberInput } from "../../src/widgets/numericInputWidgets";

const { widget, updateWidget, form } = formWidgetHelper;

describe("Number Input Widget", () => {
  describe("renders values when only standard properties are set as", () => {
    beforeEach(async () => {
      await waitFor(() => {
        updateWidget(<NumberInput name={"test"} label={"testme"} decimals={0} />);
      });
    });

    it("initially null if no form value", () => {
      expect(form().getFieldValue("test")).toBe(null);
    });

    it("initially 1 when form value is 1", async () => {
      await waitFor(() => form().setFieldsValue({ test: 1 }));
      expect(form().getFieldValue("test")).toBe(1);
    });

    it("1 if set manually", async () => {
      widget().setValueOnInputLabeled("testme", "1");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(1);
      });
    });
  });

  describe("renders explicitly with initialValue as", () => {
    beforeEach(() => {
      updateWidget(<NumberInput name={"test"} label={"testme"} initialValue={1} decimals={0} />);
    });

    it("untouched if not set by form", () => {
      expect(form().getFieldValue("test")).toBe(1);
    });

    it("overruled by form", async () => {
      await waitFor(() => form().setFieldsValue({ test: 2 }));
      expect(form().getFieldValue("test")).toBe(2);
    });

    it("overruled manually", async () => {
      widget().setValueOnInputLabeled("testme", "3");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(3);
      });
    });
  });

  describe("renders disabled", () => {
    beforeEach(async () => {
      await waitFor(() => {
        updateWidget(<NumberInput name={"test"} label={"testme"} decimals={0} disabled />);
      });
    });

    it("NOT prohibiting programmatic value changes", async () => {
      await waitFor(() => form().setFieldsValue({ test: 1 }));
      widget().setValueOnInputLabeled("testme", 3);
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(3);
      });
    });
  });

  describe("renders item without disable", () => {
    beforeEach(async () => {
      await waitFor(() => {
        updateWidget(<NumberInput name={"test"} label={"testme"} decimals={0} />);
      });
    });

    it("should keep the value set on it after being disabled", async () => {
      widget().setValueOnInputLabeled("testme", 3);

      await waitFor(() => {
        updateWidget(<NumberInput name={"test"} label={"testme"} decimals={0} disabled />, true);
      });

      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(3);
      });
    });

    it("should not reflect the initial value after the first modification", async () => {
      widget().setValueOnInputLabeled("testme", 4);

      await waitFor(() => {
        updateWidget(<NumberInput name={"test"} label={"testme"} decimals={0} initialValue={3} />, true);
      });

      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(4);
      });
    });
  });

  describe("executes callback on value change", () => {
    let tunnelVal: any;
    beforeEach(async () => {
      await waitFor(() => {
        updateWidget(<NumberInput name={"test"} label={"testme"} decimals={0} onChange={(val) => (tunnelVal = val)} />);
      });
    });

    it("but not on initial rendering", async () => {
      await waitFor(() => form().setFieldsValue({ test: 1 }));
      expect(tunnelVal).toBe(undefined);
    });

    it("when changed", async () => {
      widget().setValueOnInputLabeled("testme", 3);
      await waitFor(() => {
        expect(tunnelVal).toBe(3);
      });
      widget().setValueOnInputLabeled("testme", 555);
      await waitFor(() => {
        expect(tunnelVal).toBe(555);
      });
    });
  });

  describe("handles long decimals", () => {
    beforeEach(async () => {
      await waitFor(() => {
        updateWidget(<NumberInput name={"test"} label={"testme"} decimals={10} />);
      });
    });

    it("on form value cuts down to 10 decimals", async () => {
      await waitFor(() => form().setFieldsValue({ test: 1.123123123123 }));
      expect(form().getFieldValue("test")).toBe(1.1231231231);
    });

    it("on setting value cuts down to 10 decimals", async () => {
      widget().setValueOnInputLabeled("testme", "1,123123123123");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(1.1231231231);
      });
    });

    it("on form value does not fill up to 10 decimals", async () => {
      await waitFor(() => form().setFieldsValue({ test: 1.123 }));
      expect(form().getFieldValue("test")).toBe(1.123);
    });

    it("on setting value does not fill up to 10 decimals", async () => {
      widget().setValueOnInputLabeled("testme", "1,123");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(1.123);
      });
    });
  });

  describe("value is forced between min and max", () => {
    beforeEach(async () => {
      await waitFor(() => {
        updateWidget(<NumberInput name={"test"} label={"testme"} decimals={0} min={2} max={7} />);
      });
    });

    it("rounds up to lower limit on form value", async () => {
      await waitFor(() => form().setFieldsValue({ test: 1 }));
      expect(form().getFieldValue("test")).toBe(2);
    });

    it("rounds up to lower limit on setting value", async () => {
      widget().setValueOnInputLabeled("testme", "1");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(2);
      });
    });

    it("rounds down to upper limit on form value", async () => {
      await waitFor(() => form().setFieldsValue({ test: 9 }));
      expect(form().getFieldValue("test")).toBe(7);
    });

    it("rounds down to upper limit on setting value", async () => {
      widget().setValueOnInputLabeled("testme", "9");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(7);
      });
    });
  });

  describe("value is forced between min and max exclusive (no decimals)", () => {
    beforeEach(async () => {
      await waitFor(() => {
        updateWidget(<NumberInput name={"test"} label={"testme"} decimals={0} min={2} exclusiveMin max={7} exclusiveMax />);
      });
    });

    it("rounds up to lower limit on form value", async () => {
      await waitFor(() => form().setFieldsValue({ test: 1 }));
      expect(form().getFieldValue("test")).toBe(3);
    });

    it("rounds up to lower limit on setting value", async () => {
      widget().setValueOnInputLabeled("testme", "1");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(3);
      });
    });

    it("rounds down to upper limit on form value", async () => {
      await waitFor(() => form().setFieldsValue({ test: 9 }));
      expect(form().getFieldValue("test")).toBe(6);
    });

    it("rounds down to upper limit on setting value", async () => {
      widget().setValueOnInputLabeled("testme", 9);
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(6);
      });
    });
  });

  describe("value is forced between min and max exclusive (two decimals)", () => {
    beforeEach(async () => {
      await waitFor(() => {
        updateWidget(<NumberInput name={"test"} label={"testme"} decimals={2} min={2} exclusiveMin max={7} exclusiveMax />);
      });
    });

    it("rounds up to lower limit on form value", async () => {
      await waitFor(() => form().setFieldsValue({ test: 1 }));
      expect(form().getFieldValue("test")).toBe(2.01);
    });

    it("rounds up to lower limit on setting value", async () => {
      widget().setValueOnInputLabeled("testme", "1");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(2.01);
      });
    });

    it("rounds down to upper limit on form value", async () => {
      await waitFor(() => form().setFieldsValue({ test: 9 }));
      expect(form().getFieldValue("test")).toBe(6.99);
    });

    it("rounds down to upper limit on setting value", async () => {
      widget().setValueOnInputLabeled("testme", "9");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(6.99);
      });
    });
  });

  describe("when entering text", () => {
    beforeEach(async () => {
      await waitFor(() => {
        updateWidget(<NumberInput name={"test"} label={"testme"} initialValue={5} decimals={2} min={2} max={7} />);
      });
    });

    it("should allow entering values outside the limits before blur", async () => {
      const inputField = screen.getByLabelText("testme:", {
        selector: "input",
      }) as HTMLInputElement;

      // @ts-expect-error false positive
      expect(inputField).toBeInTheDocument();
      await fireEvent.change(inputField, { target: { value: "1" } });
      expect(inputField.value).toEqual("1");

      await fireEvent.change(inputField, { target: { value: "9" } });
      expect(inputField.value).toEqual("9");
    });

    it("should snap value between limits after blur", async () => {
      const inputField = screen.getByLabelText("testme:", {
        selector: "input",
      }) as HTMLInputElement;

      // @ts-expect-error false positive
      expect(inputField).toBeInTheDocument();
      await fireEvent.change(inputField, { target: { value: "1" } });
      expect(inputField.value).toEqual("1");

      await fireEvent.blur(inputField);
      expect(Number(inputField.value.replace(",", "."))).toEqual(2);

      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(2);
      });

      await fireEvent.change(inputField, { target: { value: "9" } });
      expect(inputField.value).toEqual("9");

      await fireEvent.blur(inputField);
      expect(Number(inputField.value.replace(",", "."))).toEqual(7);

      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(7);
      });
    });
  });
});