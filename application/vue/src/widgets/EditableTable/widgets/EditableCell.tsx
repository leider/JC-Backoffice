import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { EditableContext } from "@/widgets/EditableTable/EditableContext.tsx";
import { AnyObject } from "antd/es/_util/type";
import { Columns } from "@/widgets/EditableTable/types.ts";
import MitarbeiterMultiSelect from "@/widgets/MitarbeiterMultiSelect.tsx";
import { useTableContext } from "@/widgets/EditableTable/useTableContext.ts";
import { ColorField } from "@/widgets/ColorField.tsx";
import { NumberInput } from "@/widgets/numericInputWidgets";
import DateInput from "@/widgets/DateAndTimeInputs.tsx";
import { TextField } from "@/widgets/TextField.tsx";
import SingleSelect from "@/widgets/SingleSelect.tsx";
import CheckItem from "@/widgets/CheckItem.tsx";
import StartEndDateOnlyPickersInTable from "@/widgets/EditableTable/widgets/StartEndDateOnlyPickersInTable.tsx";

interface EditableCellProps<T> extends Columns {
  record: T;
  handleSave: (record: T, field: unknown) => void;
  index?: number;
}

const EditableCell = <RecordType extends AnyObject = AnyObject>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title, // to not have it in restProps
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  type,
  required,
  presets,
  usersWithKann,
  filters,
  min,
  index,
  initialValue,
  ...restProps
}: React.PropsWithChildren<EditableCellProps<RecordType>>) => {
  const [editing, setEditing] = useState(false);
  const [editByMouse, setEditByMouse] = useState(false);
  const { endEdit } = useTableContext();

  const ref = useRef<any>(null); // eslint-disable-line  @typescript-eslint/no-explicit-any

  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      ref.current?.focus();
    }
  }, [editing]);

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave(record, values);
    } catch {
      /* empty */
    }
  };

  const readonlyStyle = useMemo(() => {
    switch (type) {
      case "color":
        return { padding: "6px", paddingLeft: "4px" };
      case "user":
        return { padding: "6px", paddingLeft: "0px" };
      case "integer":
        return { padding: "6px", marginRight: "6px" };
      case "boolean":
        return { padding: "6px", paddingTop: "8px", paddingBottom: "2px" };
      case "date":
        return { padding: "6px", marginLeft: "6px" };
      case "text":
        return { padding: "6px", marginLeft: "6px" };
      default:
        return { padding: "6px", marginLeft: "6px" };
    }
  }, [type]);

  if (!editable) {
    return <td {...restProps}>{children}</td>;
  }

  function toggleEdit() {
    const willNowEdit = !editing;
    if (willNowEdit) {
      endEdit({
        endEditing: () => {
          setEditing(false);
        },
      });
    }
    setEditing(willNowEdit);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  }

  let Widget;
  switch (type) {
    case "user":
      Widget = <MitarbeiterMultiSelect name={dataIndex} usersAsOptions={usersWithKann ?? []} save={save} focus />;
      break;
    case "color":
      Widget = <ColorField name={dataIndex} save={save} required={required} presets={presets} />;
      break;
    case "integer":
      Widget = (
        <NumberInput
          decimals={0}
          name={dataIndex}
          required={required}
          min={min as number}
          initialValue={initialValue as number}
          save={save}
          focus
        />
      );
      break;
    case "date":
      Widget = <DateInput name={dataIndex} required={required} save={save} focus />;
      break;
    case "startEnd":
      Widget = <StartEndDateOnlyPickersInTable name={dataIndex} save={save} focus />;
      break;
    case "boolean":
      Widget = <CheckItem name={dataIndex} required={required} save={save} focus focusByMouseClick={editByMouse && editing} />;
      break;
    default:
      Widget = filters ? (
        <SingleSelect name={dataIndex} required={required} options={filters} save={save} focus />
      ) : (
        <TextField name={dataIndex} required={required} save={save} focus />
      );
      break;
  }

  const childNode = !editing ? (
    <div
      data-testid={dataIndex + index}
      tabIndex={0}
      onFocus={type !== "color" ? toggleEdit : undefined}
      onClick={toggleEdit}
      onMouseDown={() => setEditByMouse(true)}
      style={readonlyStyle}
    >
      {children}
    </div>
  ) : (
    Widget
  );
  return <td {...restProps}>{childNode}</td>;
};

export default EditableCell;
