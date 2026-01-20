import React from "react";
import { JazzColumn } from "@/widgets/EditableTable/types.ts";
import MitarbeiterMultiSelect, { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import { ColorField } from "@/widgets/ColorField.tsx";
import { NumberInput } from "@/widgets/numericInputWidgets";
import DateInput from "@/widgets/DateAndTimeInputs.tsx";
import { TextField } from "@/widgets/TextField.tsx";
import SingleSelect from "@/widgets/SingleSelect.tsx";
import CheckItem from "@/widgets/CheckItem.tsx";
import StartEndDateOnlyPickersInTable from "@/widgets/EditableTable/widgets/StartEndDateOnlyPickersInTable.tsx";
import { Rule } from "antd/es/form";

export interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  readonly index?: number;
  readonly column: JazzColumn;
  readonly uniqueRule?: Rule;
  readonly usersWithKann?: UserWithKann[];
}

export default function EditableCell({ index, column, uniqueRule, usersWithKann }: EditableCellProps) {
  const { dataIndex, editable = true, type, required, presets, dropdownchoices, min, initialValue, multiline } = column ?? {};
  const itemName = ["" + index, dataIndex];

  switch (type) {
    case "user":
      return <MitarbeiterMultiSelect name={itemName} useInTable usersAsOptions={usersWithKann ?? []} />;
    case "color":
      return <ColorField name={itemName} presets={presets} required={required} useInTable />;
    case "integer":
    case "twoDecimals":
      return (
        <NumberInput
          decimals={type === "integer" ? 0 : 2}
          initialValue={(initialValue as number) ?? 0}
          min={min as number}
          name={itemName}
          required={required}
          useInTable
        />
      );
    case "date":
      return <DateInput name={itemName} required={required} useInTable />;
    case "startEnd":
      return <StartEndDateOnlyPickersInTable name={itemName} useInTable />;
    case "boolean":
      return <CheckItem name={itemName} required={required} />;
    default:
      return dropdownchoices ? (
        <SingleSelect name={itemName} options={dropdownchoices} required={required} useInTable />
      ) : (
        <TextField
          editable={editable}
          multiline={multiline}
          name={itemName}
          required={required}
          uniqueValuesValidator={uniqueRule}
          useInTable
        />
      );
  }
}
