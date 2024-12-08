import { ByRoleMatcher, ByRoleOptions, fireEvent, render } from "@testing-library/react";
import { AntdAndLocaleTestContext, InlineCollectionEditableResult, selectOption, setDate, setValueOnInput } from "./testHelper";
import { BrowserRouter } from "react-router";
import { JSX } from "react";

export interface TestHelper {
  getByRole: (role: ByRoleMatcher, options?: ByRoleOptions | undefined) => HTMLElement;
  setValueOnInputLabeled: (name: string, value: string | boolean) => void;
  selectOptionLabeled: (name: string, value: string) => Promise<void>;
  setDateLabeled: (name: string, value: string) => Promise<void>;
  saveForm: () => void;
  addItemTo: (
    inlineCollectionEditable: InlineCollectionEditableResult,
    values: { type: "text" | "date" | "option"; value: unknown }[],
  ) => Promise<void>;
  clickByText: (text: string) => boolean;
  rerenderComponent: (page: JSX.Element) => void;
  container: HTMLElement;
}

export function createTestHelperFor(page: JSX.Element): TestHelper {
  const { getByRole, getByLabelText, getByText, rerender, container } = render(
    <AntdAndLocaleTestContext>
      <BrowserRouter>{page}</BrowserRouter>
    </AntdAndLocaleTestContext>,
  );

  function rerenderComponent(page: JSX.Element): void {
    rerender(
      <AntdAndLocaleTestContext>
        <BrowserRouter>{page}</BrowserRouter>
      </AntdAndLocaleTestContext>,
    );
  }

  function setValueOnInputLabeled(name: string, value: string | boolean): void {
    setValueOnInput(getByLabelText(`${name}:`), value);
  }

  async function selectOptionLabeled(name: string, value: string) {
    await selectOption(getByLabelText(name), value);
  }

  async function setDateLabeled(name: string, value: string) {
    await setDate(getByLabelText(name), value);
  }

  async function addItemTo(
    inlineCollectionEditable: InlineCollectionEditableResult,
    values: { type: "text" | "date" | "option"; value: unknown }[],
  ) {
    const row = await inlineCollectionEditable.addItem();
    const inputs = row.querySelectorAll("input");
    for (let index = 0; index < values.length; index++) {
      const field = values[index];
      const input = inputs[index];
      const value = field.value;
      switch (field.type) {
        case "date":
          await setDate(input, value as string);
          break;
        case "text":
          setValueOnInput(input, value);
          break;
        case "option":
          await selectOption(input, value as string);
          break;
      }
    }
  }

  function clickByText(text: string) {
    return fireEvent.click(getByText(text));
  }

  function saveForm() {
    fireEvent.click(getByText("common:save"));
  }

  return {
    rerenderComponent,
    getByRole,
    setValueOnInputLabeled,
    selectOptionLabeled,
    setDateLabeled,
    saveForm,
    addItemTo,
    clickByText,
    container,
  };
}
