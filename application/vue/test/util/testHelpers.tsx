/* eslint-disable react-refresh/only-export-components */
import { fireEvent } from "@testing-library/react";
import { Form, FormInstance } from "antd";

import { createTestHelperFor, TestHelper } from "./advancedTestHelper";

import "numeral/locales/de";

import * as numeral from "numeral";

type FormWithProps = {
  readonly children: React.JSX.Element;
  readonly tunnel: { form?: FormInstance };
};

numeral.locale("de");
numeral.localeData("de").delimiters.thousands = ".";

export function FormWith({ tunnel, children }: FormWithProps) {
  const [form] = Form.useForm();
  tunnel.form = form;
  return <Form form={form}>{children}</Form>;
}

const tunnel: { form?: FormInstance } = {};

let formWidgetComponent: TestHelper | undefined = undefined;

function updateWidget(widget: React.JSX.Element, rerender?: boolean) {
  if (rerender) {
    formWidgetComponent?.rerenderComponent(<FormWith tunnel={tunnel}>{widget}</FormWith>);
  } else {
    formWidgetComponent = createTestHelperFor(<FormWith tunnel={tunnel}>{widget}</FormWith>);
  }
}

function form() {
  return tunnel.form!;
}

function widget() {
  return formWidgetComponent!;
}

export async function performClickOnItem(elem: HTMLElement) {
  await fireEvent(
    elem,
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    }),
  );
}

export const formWidgetHelper = {
  widget,
  form,
  updateWidget,
};
