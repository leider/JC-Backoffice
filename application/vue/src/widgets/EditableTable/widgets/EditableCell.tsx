import React, { useMemo } from "react";
import { AnyObject } from "antd/es/_util/type";
import { JazzColumn } from "@/widgets/EditableTable/types.ts";
import MitarbeiterMultiSelect from "@/widgets/MitarbeiterMultiSelect.tsx";
import { ColorField } from "@/widgets/ColorField.tsx";
import { NumberInput } from "@/widgets/numericInputWidgets";
import DateInput from "@/widgets/DateAndTimeInputs.tsx";
import { TextField } from "@/widgets/TextField.tsx";
import SingleSelect from "@/widgets/SingleSelect.tsx";
import CheckItem from "@/widgets/CheckItem.tsx";
import StartEndDateOnlyPickersInTable from "@/widgets/EditableTable/widgets/StartEndDateOnlyPickersInTable.tsx";
import type { NamePath } from "antd/es/form/interface";

export interface EditableCellProps<T> extends React.HTMLAttributes<HTMLElement> {
  readonly name: NamePath;
  readonly record: T;
  readonly index?: number;
  readonly column: JazzColumn;
}

export default function EditableCell<RecordType extends AnyObject = AnyObject>({
  children,
  index,
  column,
  ...restProps
}: React.PropsWithChildren<EditableCellProps<RecordType>>) {
  const { editable, dataIndex, type, required, presets, usersWithKann, dropdownchoices, min, initialValue, multiline } = column ?? {};

  const itemName: NamePath = useMemo(() => {
    return ["" + index, dataIndex];
  }, [dataIndex, index]);

  const Widget = useMemo(() => {
    switch (type) {
      case "user":
        return <MitarbeiterMultiSelect name={itemName} usersAsOptions={usersWithKann ?? []} />;
      case "color":
        return <ColorField name={itemName} presets={presets} required={required} />;
      case "integer":
        return (
          <NumberInput decimals={0} initialValue={(initialValue as number) ?? 0} min={min as number} name={itemName} required={required} />
        );
      case "twoDecimals":
        return (
          <NumberInput decimals={2} initialValue={(initialValue as number) ?? 0} min={min as number} name={itemName} required={required} />
        );
      case "date":
        return <DateInput name={itemName} required={required} />;
      case "startEnd":
        return <StartEndDateOnlyPickersInTable name={itemName} />;
      case "boolean":
        return <CheckItem name={itemName} required={required} />;
      default:
        return dropdownchoices ? (
          <SingleSelect name={itemName} options={dropdownchoices} required={required} />
        ) : (
          <TextField multiline={multiline} name={itemName} required={required} />
        );
    }
  }, [type, itemName, usersWithKann, presets, required, initialValue, min, dropdownchoices, multiline]);

  return editable ? (
    <td {...restProps} style={{ ...restProps.style, verticalAlign: "top" }}>
      {Widget}
    </td>
  ) : (
    <td {...restProps}>{children}</td>
  );
}
