import { Col } from "antd";
import React, { FunctionComponent } from "react";

import { Column } from "../column/Column";
import { IWidgetColumn } from "./IWidgetColumn";
import { TextField } from "@/widgets/TextField";
import SingleSelect from "@/widgets/SingleSelect";
import { NumberInput } from "@/widgets/numericInputWidgets";
import CheckItem from "@/widgets/CheckItem";
import StartEndDateOnlyPickers from "@/widgets/StartEndDateOnlyPickers";
import UserMultiSelect from "@/components/team/UserMultiSelect";
import { ColorField } from "@/widgets/ColorField.tsx";

/**
 Orrp inline collection table widget column component.
 * @param {IWidgetColumn} props
 * @return {*}  {React.ReactElement}
 */
export const WidgetColumn: FunctionComponent<IWidgetColumn> = (props: IWidgetColumn): React.ReactElement => {
  const { desc, name, colSpans, disabled, uniqueValuesValidator } = props;

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
  let Widget: React.ReactElement | null = null;
  switch (desc.type) {
    case "color":
      Widget = <ColorField {...commonProps} />;
      break;
    case "user":
      Widget = <UserMultiSelect usersAsOptions={desc.labelsAndValues!} {...commonProps} />;
      break;
    case "text":
      Widget = desc.filters ? (
        <SingleSelect options={desc.filters} {...commonProps} />
      ) : (
        <TextField onChange={desc.onChange} {...commonProps} uniqueValuesValidator={uniqueValuesValidator} />
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
