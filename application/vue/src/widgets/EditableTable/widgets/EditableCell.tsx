import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { NamePath } from "rc-field-form/es/interface";

interface EditableCellProps<T> extends Columns {
  readonly record: T;
  readonly handleSave: (record: T, field: unknown) => void;
  readonly index?: number;
  readonly surroundingName: NamePath;
}

function EditableCell<RecordType extends AnyObject = AnyObject>({
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
  surroundingName,
  multiline,
  ...restProps
}: React.PropsWithChildren<EditableCellProps<RecordType>>) {
  const [editing, setEditing] = useState(false);
  const [editByMouse, setEditByMouse] = useState(false);
  const { endEdit } = useTableContext();
  const { isCompactMode } = useJazzContext();
  const name = useMemo(() => {
    const prefix = !Array.isArray(surroundingName) ? [surroundingName] : surroundingName;
    const suffix = !Array.isArray(dataIndex) ? [dataIndex] : dataIndex;
    return [...prefix, index, ...suffix];
  }, [dataIndex, index, surroundingName]);

  const ref = useRef<any>(null); // eslint-disable-line  @typescript-eslint/no-explicit-any

  const form = useFormInstance(); //useContext(EditableContext)!;
  const [backupValue, setBackupValue] = useState<unknown>(undefined);

  useEffect(() => {
    if (editing) {
      ref.current?.focus();
    }
  }, [editing]);

  const toggleEdit = useCallback(() => {
    const willNowEdit = !editing;
    if (willNowEdit) {
      endEdit({
        endEditing: () => {
          setEditing(false);
        },
      });
    }
    setEditing(willNowEdit);
    setBackupValue(record[dataIndex]);
  }, [dataIndex, editing, endEdit, record]);

  const save = useCallback(
    (keepEditing?: boolean) => {
      const val = form.getFieldValue(name);
      !keepEditing && toggleEdit();
      if (val === backupValue) {
        !keepEditing && setBackupValue(undefined);
        return;
      }
      const res: { [_: string]: unknown } = {};
      res[dataIndex] = val;
      handleSave(record, res);
    },
    [backupValue, dataIndex, form, handleSave, name, record, toggleEdit],
  );

  const readonlyStyle = useMemo(() => {
    if (isCompactMode) {
      switch (type) {
        case "color":
          return { padding: "4px", paddingLeft: "4px" };
        case "user":
          return { padding: "4px", paddingLeft: "0px" };
        case "integer":
          return { padding: "4px", marginRight: "4px" };
        case "boolean":
          return { paddingRight: "6px", paddingTop: "6px", paddingBottom: "0px", paddingLeft: "0px" };
        default:
          return { padding: "4px", marginLeft: "4px" };
      }
    }
    switch (type) {
      case "color":
        return { padding: "6px", paddingLeft: "4px" };
      case "user":
        return { padding: "6px", paddingLeft: "0px" };
      case "integer":
        return { padding: "6px", marginRight: "6px" };
      case "boolean":
        return { paddingRight: "16px", paddingTop: "8px", paddingBottom: "2px", paddingLeft: "0px" };
      default:
        return { padding: "6px", marginLeft: "6px" };
    }
  }, [isCompactMode, type]);

  if (!editable) {
    return <td {...restProps}>{children}</td>;
  }

  let Widget;
  switch (type) {
    case "user":
      Widget = <MitarbeiterMultiSelect focus name={name} save={save} usersAsOptions={usersWithKann ?? []} />;
      break;
    case "color":
      Widget = <ColorField name={name} presets={presets} required={required} save={save} />;
      break;
    case "integer":
      Widget = (
        <NumberInput
          decimals={0}
          focus
          initialValue={(initialValue as number) ?? 0}
          min={min as number}
          name={name}
          required={required}
          save={save}
        />
      );
      break;
    case "twoDecimals":
      Widget = (
        <NumberInput
          decimals={2}
          focus
          initialValue={(initialValue as number) ?? 0}
          min={min as number}
          name={name}
          required={required}
          save={save}
        />
      );
      break;
    case "date":
      Widget = <DateInput focus name={name} required={required} save={save} />;
      break;
    case "startEnd":
      Widget = <StartEndDateOnlyPickersInTable focus name={name} save={save} />;
      break;
    case "boolean":
      Widget = <CheckItem focus focusByMouseClick={editByMouse ? editing : false} name={name} required={required} save={save} />;
      break;
    default:
      Widget = filters ? (
        <SingleSelect focus name={name} options={filters} required={required} save={save} />
      ) : (
        <TextField focus multiline={multiline} name={name} required={required} save={save} />
      );
      break;
  }

  const childNode = !editing ? (
    <div
      data-testid={dataIndex + index}
      onClick={toggleEdit}
      onFocus={type !== "color" ? toggleEdit : undefined}
      onMouseDown={() => setEditByMouse(true)}
      style={readonlyStyle}
      tabIndex={0}
    >
      {children}
    </div>
  ) : (
    Widget
  );
  return <td {...restProps}>{childNode}</td>;
}

export default EditableCell;
