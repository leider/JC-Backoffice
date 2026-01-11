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

  const readonlyRef = useRef<HTMLDivElement>(null);
  const form = useContext(EditableContext)!;

  const backupValRef = useRef<any>(undefined); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    if (!editing) return;
    // If a widget doesn't manage focus itself, at least keep focus inside the cell.
    // Most widgets already receive `focus`, so this is a fallback.
    readonlyRef.current?.focus();
  }, [editing]);

  const onMouseDown = useCallback(() => setEditByMouse(true), []);

  const startEdit = useCallback(() => {
    endEdit({
      endEditing: () => {
        setEditing(false);
      },
    });

    setEditing(true);
    backupValRef.current = record[dataIndex];

    // AntD: prefer setting a single field value.
    form.setFieldValue(dataIndex, record[dataIndex]);
  }, [dataIndex, endEdit, form, record]);

  const endEditLocal = useCallback(() => {
    setEditing(false);
  }, []);

  const save = useCallback(
    async (keepEditing?: boolean) => {
      try {
        const value = form.getFieldValue(dataIndex);

        if (keepEditing !== true) {
          endEditLocal();
        }

        if (backupValRef.current === value) return;

        backupValRef.current = undefined;
        handleSave(record, { [dataIndex]: value });
      } catch {
        /* empty */
      }
    },
    [dataIndex, endEditLocal, form, handleSave, record],
  );

  const onEditorBlurCapture = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      // Save when focus leaves the *cell*. If focus moves to another element inside the cell, do nothing.
      const next = e.relatedTarget as Node | null;
      if (next && e.currentTarget.contains(next)) return;
      save();
    },
    [save],
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
    if (!editing) {
      return (
        <div
          data-testid={dataIndex + index}
          onClick={startEdit}
          onFocus={type !== "color" ? startEdit : undefined}
          onMouseDown={onMouseDown}
          ref={readonlyRef}
          style={readonlyStyle}
          tabIndex={0}
        >
          {children}
        </div>
      );
    }

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
  }, [
    children,
    dataIndex,
    dropdownchoices,
    editByMouse,
    editing,
    index,
    initialValue,
    min,
    multiline,
    onMouseDown,
    presets,
    readonlyStyle,
    required,
    save,
    startEdit,
    type,
    usersWithKann,
  ]);

  return editable ? (
    <td {...restProps} style={{ ...restProps.style, verticalAlign: "top" }}>
      {editing ? (
        <div onBlurCapture={onEditorBlurCapture}>{Widget}</div>
      ) : (
        // Keep this wrapper out of the tab order; the inner div is already tabIndex=0.
        <div tabIndex={-1}>{Widget}</div>
      )}
    </td>
  ) : (
    <td {...restProps}>{children}</td>
  );
}
