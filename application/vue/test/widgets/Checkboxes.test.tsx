import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { formWidgetHelper } from "../util/testHelpers";
import ThreewayCheckbox from "../../src/widgets/ThreewayCheckbox";
import CheckItem from "../../src/widgets/CheckItem";
import InverseCheckbox from "../../src/widgets/InverseCheckbox";
import { Form } from "antd";

const { widget, updateWidget, form } = formWidgetHelper;

describe("Checkbox Widgets", () => {
  describe("Threeway renders", () => {
    beforeEach(async () => {
      await waitFor(() => {
        updateWidget(<ThreewayCheckbox name={"test"} label={"testme"} />);
      });
    });

    it("initially undefined if no form value", () => {
      expect(form().getFieldValue("test")).toBe(undefined);
    });

    it("toggles 'true', 'false', 'undefined'", async () => {
      widget().clickByText("testme");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(true);
      });

      widget().clickByText("testme");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(false);
      });

      widget().clickByText("testme");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(undefined);
      });

      widget().clickByText("testme");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(true);
      });
    });
  });

  describe("CheckItem renders", () => {
    beforeEach(async () => {
      await waitFor(() => {
        updateWidget(<CheckItem name={"test"} label={"testme"} />);
      });
    });

    it("initially undefined if no form value", () => {
      expect(form().getFieldValue("test")).toBe(undefined);
    });

    it("toggles 'true', 'false'", async () => {
      widget().clickByText("testme");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(true);
      });

      widget().clickByText("testme");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(false);
      });

      widget().clickByText("testme");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(true);
      });
    });
  });

  describe("InverseCheck renders", () => {
    beforeEach(async () => {
      await waitFor(() => {
        updateWidget(
          <Form.Item name={"test"} label={"testme"} valuePropName="checked">
            <InverseCheckbox />
          </Form.Item>,
        );
      });
    });

    it("initially undefined if no form value", () => {
      expect(form().getFieldValue("test")).toBe(undefined);
    });

    it("toggles 'true', 'false'", async () => {
      widget().clickByText("testme");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(false);
      });

      widget().clickByText("testme");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(true);
      });

      widget().clickByText("testme");
      await waitFor(() => {
        expect(form().getFieldValue("test")).toBe(false);
      });
    });
  });
});
