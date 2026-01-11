import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { EditableContext } from "@/widgets/EditableTable/EditableContext.tsx";
import { AnyObject } from "antd/es/_util/type";
import { JazzColumn } from "@/widgets/EditableTable/types.ts";
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

export interface EditableCellProps<T> extends React.HTMLAttributes<HTMLElement> {
  readonly record: T;
  readonly handleSave: (record: T, field: object) => void;
  readonly index?: number;
  readonly column: JazzColumn;
}

type ChildNodeProps = {
  readonly children: React.ReactNode;
  readonly dataTestId: string;
  readonly editing: boolean;
  readonly onClick: React.MouseEventHandler<HTMLDivElement>;
  readonly onFocus?: React.FocusEventHandler<HTMLDivElement>;
  readonly onMouseDown: React.MouseEventHandler<HTMLDivElement>;
  readonly readonlyStyle: React.CSSProperties;
  readonly widget: React.ReactNode;
};

function ChildNode({ children, dataTestId, editing, onClick, onFocus, onMouseDown, readonlyStyle, widget }: ChildNodeProps) {
  if (editing) return widget;
  return (
    <div data-testid={dataTestId} onClick={onClick} onFocus={onFocus} onMouseDown={onMouseDown} style={readonlyStyle} tabIndex={0}>
      {children}
    </div>
  );
}

export default function EditableCell<RecordType extends AnyObject = AnyObject>({
  children,
  record,
  handleSave,
  index,
  column,
  ...restProps
}: React.PropsWithChildren<EditableCellProps<RecordType>>) {
  const [editing, setEditing] = useState(false);
  const [editByMouse, setEditByMouse] = useState(false);
  const { endEdit } = useTableContext();
  const { isCompactMode } = useJazzContext();
  const { editable, dataIndex, type, required, presets, usersWithKann, dropdownchoices, min, initialValue, multiline } = column ?? {};

  const ref = useRef<HTMLElement>(null);
  const form = useContext(EditableContext)!;

  const [backupVal, setBackupVal] = useState<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    if (editing) {
      ref.current?.focus();
    }
  }, [editing]);

  const onMouseDown = useCallback(() => setEditByMouse(true), []);

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
    setBackupVal({ [dataIndex]: record[dataIndex] });
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  }, [editing, dataIndex, record, form, endEdit]);

  const save = useCallback(
    async (keepEditing?: boolean) => {
      try {
        const value = form.getFieldValue(dataIndex);
        if (keepEditing !== true) toggleEdit();
        setBackupVal(undefined);
        if (backupVal?.[dataIndex] === value) return;
        handleSave(record, { [dataIndex]: value });
      } catch {
        /* empty */
      }
    },
    [backupVal, dataIndex, form, handleSave, record, toggleEdit],
  );

  const readonlyStyle = useMemo(() => {
    if (isCompactMode) {
      switch (type) {
        case "color":
          return { padding: "2px 4px 0px 4px" };
        case "user":
          return { padding: "4px", paddingLeft: "0px" };
        case "integer":
          return { padding: "4px", marginRight: "4px" };
        case "boolean":
          return { padding: "4px", paddingTop: "6px", paddingBottom: "0px" };
        default:
          return { padding: "5px", marginLeft: "4px" };
      }
    }
    switch (type) {
      case "color":
        return { padding: "6px 4px 0px 4px" };
      case "user":
        return { padding: "6px", paddingLeft: "0px" };
      case "integer":
        return { padding: "6px", marginRight: "6px" };
      case "boolean":
        return { padding: "6px", paddingTop: "8px", paddingBottom: "2px" };
      default:
        return { padding: "6px", marginLeft: "6px" };
    }
  }, [isCompactMode, type]);

  const Widget = useMemo(() => {
    switch (type) {
      case "user":
        return <MitarbeiterMultiSelect focus name={dataIndex} save={save} usersAsOptions={usersWithKann ?? []} />;
      case "color":
        return <ColorField name={dataIndex} presets={presets} required={required} save={save} />;
      case "integer":
        return (
          <NumberInput
            decimals={0}
            focus
            initialValue={(initialValue as number) ?? 0}
            min={min as number}
            name={dataIndex}
            required={required}
            save={save}
          />
        );
      case "twoDecimals":
        return (
          <NumberInput
            decimals={2}
            focus
            initialValue={(initialValue as number) ?? 0}
            min={min as number}
            name={dataIndex}
            required={required}
            save={save}
          />
        );
      case "date":
        return <DateInput focus name={dataIndex} required={required} save={save} />;
      case "startEnd":
        return <StartEndDateOnlyPickersInTable focus name={dataIndex} save={save} />;
      case "boolean":
        return <CheckItem focus focusByMouseClick={editByMouse ? editing : false} name={dataIndex} required={required} save={save} />;
      default:
        return dropdownchoices ? (
          <SingleSelect focus name={dataIndex} options={dropdownchoices} required={required} save={save} />
        ) : (
          <TextField focus multiline={multiline} name={dataIndex} required={required} save={save} />
        );
    }
  }, [dataIndex, dropdownchoices, editByMouse, editing, initialValue, min, multiline, presets, required, save, type, usersWithKann]);

  return editable ? (
    <td {...restProps} style={{ ...restProps.style, verticalAlign: "top" }}>
      <ChildNode
        dataTestId={dataIndex + index}
        editing={editing}
        onClick={toggleEdit}
        onFocus={type !== "color" ? toggleEdit : undefined}
        onMouseDown={onMouseDown}
        readonlyStyle={readonlyStyle}
        widget={Widget}
      >
        {children}
      </ChildNode>
    </td>
  ) : (
    <td {...restProps}>{children}</td>
  );
}
