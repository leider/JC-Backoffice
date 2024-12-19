import { Col } from "antd";
import React, { FC } from "react";

import { Column } from "../column/Column";
import { TextField } from "@/widgets/TextField";
import SingleSelect from "@/widgets/SingleSelect";
import { NumberInput } from "@/widgets/numericInputWidgets";
import CheckItem from "@/widgets/CheckItem";
import StartEndDateOnlyPickers from "@/components/konzert/hotel/StartEndDateOnlyPickers.tsx";
import { ColorField } from "@/widgets/ColorField.tsx";
import { ColDescWithIdx } from "@/widgets/InlineCollectionEditable/types.ts";
import { Rule } from "antd/es/form";
import MitarbeiterMultiSelect from "@/widgets/MitarbeiterMultiSelect.tsx";
import DateInput from "@/widgets/DateAndTimeInputs.tsx";

interface IWidgetColumn {
  /**
   * The description of the column.
   * @type {ColDescWithIdx}
   * @memberof IWidgetColumn
   */
  desc: ColDescWithIdx;

  /**
   * The name of the column.
   * @type {number}
   * @memberof IWidgetColumn
   */
  name: number;

  /**
   * The column span.
   * @type {number[]}
   * @memberof IWidgetColumn
   */
  colSpans: number[];

  /**
   * Whether the column is disabled.
   * @type {boolean}
   * @memberof IWidgetColumn
   */
  disabled?: boolean;

  /**
   * An unique values validator function.
   * @type {*}
   * @memberof IWidgetColumn
   */
  uniqueValuesValidator?: Rule;
  embeddedArrayPath?: string[];
}

/**
 Inline collection table widget column component.
 * @param {IWidgetColumn} props
 * @return {*}  {React.ReactElement}
 */
export const WidgetColumn: FC<IWidgetColumn> = ({
  desc,
  name,
  colSpans,
  disabled,
  uniqueValuesValidator,
  embeddedArrayPath,
}: IWidgetColumn): React.ReactElement => {
  const commonProps = {
    name: [name.toString(10)].concat(desc.fieldName),
    label: "",
    required: desc.required,
    initialValue: desc.initialValue,
    pattern: desc.pattern,
    disabled: disabled || false,
    presets: desc.presets,
  };

  // Important to not make this a JSX-Element invoked like <Widget />
  // or else form errors won't be rendered because the fields are recreated too often
  let Widget: React.ReactElement | null = null;
  switch (desc.type) {
    case "color":
      Widget = <ColorField {...commonProps} />;
      break;
    case "user":
      Widget = <MitarbeiterMultiSelect usersAsOptions={desc.usersWithKann!} {...commonProps} />;
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
    case "date": {
      Widget = <DateInput {...commonProps} />;
      break;
    }
    case "startEnd": {
      const startEndProps = {
        names: (desc.fieldName as string[]).map((fName) => embeddedArrayPath?.concat([name.toString(10)]).concat(fName)),
        label: "",
        required: desc.required,
        initialValue: desc.initialValue,
        pattern: desc.pattern,
        disabled: disabled || false,
      };
      Widget = <StartEndDateOnlyPickers {...startEndProps} />;
      break;
    }
  }
  return desc.idx === 0 ? (
    <Col flex={"auto"}>{Widget}</Col>
  ) : (
    <Column desc={desc} colSpans={colSpans}>
      {Widget}
    </Column>
  );
};
