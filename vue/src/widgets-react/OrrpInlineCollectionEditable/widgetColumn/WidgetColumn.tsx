import { Col } from "antd";
import React, { FunctionComponent } from "react";

import { Column } from "../column/Column";
import { IWidgetColumn } from "./IWidgetColumn";
import { TextField } from "@/widgets-react/TextField";
import SingleSelect from "@/widgets-react/SingleSelect";
import { NumberInput } from "@/widgets-react/numericInputWidgets";
import CheckItem from "@/widgets-react/CheckItem";
import StartEndDateOnlyPickers from "@/widgets-react/StartEndDateOnlyPickers";

/**
 Orrp inline collection table widget column component.
 * @param {IWidgetColumn} props
 * @return {*}  {JSX.Element}
 */
export const WidgetColumn: FunctionComponent<IWidgetColumn> = (props: IWidgetColumn): JSX.Element => {
  const { desc, name, colSpans, disabled } = props;

  const commonProps = {
    name: [name.toString(10)].concat(desc.fieldName),
    label: "",
    required: desc.required,
    initialValue: desc.initialValue,
    pattern: desc.pattern,
    disabled: disabled || false,
  };

  // Important to not make this a JSX-Element invoked like <Widget />
  // or else form errors won't be rendered because the fields are recreated too often
  let Widget: JSX.Element | null = null;
  switch (desc.type) {
    case "text":
      Widget = desc.filters ? (
        <SingleSelect options={desc.filters} {...commonProps} />
      ) : (
        <TextField onChange={desc.onChange} {...commonProps} />
      );
      break;
    case "integer":
    case "twoDecimals":
    case "sevenDecimals":
    case "eightDecimals":
      Widget = (
        <NumberInput
          min={desc.min as number}
          max={desc.max as number}
          exclusiveMin={desc.exclusiveMin}
          exclusiveMax={desc.exclusiveMax}
          decimals={desc.type === "integer" ? 0 : desc.type === "twoDecimals" ? 2 : desc.type === "sevenDecimals" ? 7 : 8}
          onChange={desc.onChange}
          {...commonProps}
        />
      );
      break;
    // Todo: refactor, so that decimal is in desc
    case "boolean":
      Widget = <CheckItem {...commonProps} onChange={desc.onChange} />;
      break;
    case "date":
      Widget = <StartEndDateOnlyPickers {...commonProps} />;
      break;
  }
  return desc.idx === colSpans.length - 2 ? (
    <Col flex={"auto"}>{Widget}</Col>
  ) : (
    <Column desc={desc} colSpans={colSpans}>
      {Widget}
    </Column>
  );
};
