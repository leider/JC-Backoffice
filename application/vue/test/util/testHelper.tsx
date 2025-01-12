/* eslint-disable react-refresh/only-export-components */
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { ConfigProvider } from "antd";
import localeDe from "antd/lib/locale/de_DE";
import { PropsWithChildren } from "react";

/**
 * Selects a specific option on a Antd select
 * @param selectInputEl The <input> element of the select
 * @param optionText The visible text of the select option - should be unique
 */
export async function selectOption(selectInputEl: HTMLElement, optionText: string): Promise<void> {
  const select = selectInputEl.parentElement?.parentElement as HTMLElement;
  if (!select?.classList.contains("ant-select-selector")) {
    throw new Error("Expected selectInputEl to be part of a Antd Select");
  }

  await waitFor(async () => {
    await fireEvent.mouseDown(select);
    await fireEvent.click(screen.getAllByText(optionText, { selector: "div" }).pop()!);
  });
}

/**
 * Sets a value on the given input by firing the change event
 *
 * @param input The <input> element
 * @param value The value to set
 */
export function setValueOnInput(input: HTMLElement, value: unknown) {
  fireEvent.focus(input);
  fireEvent.change(input, {
    target: { value },
  });
  fireEvent.blur(input);
}

/**
 * Sets a date on an input
 *
 * @param input The input associated with the date
 * @param date The date to set
 */
export async function setDate(input: HTMLElement, date: Date | string) {
  fireEvent.focus(input);
  fireEvent.keyDown(input, {
    key: "Enter",
    code: "Enter",
    which: 13,
    keyCode: 13,
  });
  // Keep the format in sync with the DateInput component
  const value = date; // dayjs(date).format("ll");
  fireEvent.change(input, {
    target: {
      value,
    },
  });
  fireEvent.keyDown(input, {
    key: "Enter",
    code: "Enter",
    which: 13,
    keyCode: 13,
  });
}

/**
 *  Not provided by testing library to discourage searching by id, but it's
 * sometimes the most robust way in our case since AntdForm sets ids on all inputs.
 */
export function getById(container: HTMLElement, id: string): HTMLElement {
  const el = container.querySelector("#" + id) as HTMLElement;
  if (!el) {
    throw new Error("Element with id " + id + " not found");
  }
  return el;
}

export type InlineCollectionEditableResult = {
  getRow: (idx: number) => {
    row: HTMLElement;
    getById: (id: string) => Element | null;
  };
  addItem: () => Promise<HTMLElement>;
  copyItem: (idx: number) => void;
  deleteItem: (idx: number) => void;
};

/**
 * Convenience wrapper component to create a test context which sets locales
 * for dayjs/numeral/antd to german.
 */
export function AntdAndLocaleTestContext(props: PropsWithChildren<unknown>) {
  return <ConfigProvider locale={localeDe}>{props.children}</ConfigProvider>;
}
