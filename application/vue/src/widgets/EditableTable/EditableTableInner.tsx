import { Form, FormListFieldData, Table, type TableProps } from "antd";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EditableCell from "@/widgets/EditableTable/widgets/EditableCell.tsx";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import InlineEditableActions from "@/widgets/EditableTable/InlineEditableActions.tsx";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { JazzColumn } from "./types";
import map from "lodash/map";
import { useGlobalContext } from "@/app/GlobalContext.ts";
import { ColumnType } from "antd/es/table/interface";
import type { NamePath } from "antd/es/form/interface";
import type { StoreValue, ValidatorRule } from "@rc-component/form/lib/interface";
import some from "lodash/some";
import { Reference } from "@rc-component/table/lib";
import { EditOutlined } from "@ant-design/icons";

function alignForType(item: JazzColumn) {
  switch (item.type) {
    case "integer":
      return "end";
    case "boolean":
    case "color":
      return "center";
    default:
      return "start";
  }
}
export default function EditableTableInner<T>({
  fields,
  columnDescriptions,
  usersWithKann,
  newRowFactory,
  fixedMinHeight,
  onAdd,
  onRemove,
  name,
}: {
  readonly name: NamePath;
  readonly fields?: FormListFieldData[];
  readonly columnDescriptions?: JazzColumn[];
  readonly usersWithKann?: UserWithKann[];
  readonly newRowFactory: (val: T) => T;
  readonly fixedMinHeight?: number;
  readonly onAdd?: (defaultValue?: StoreValue, insertIndex?: number) => void;
  readonly onRemove?: (index: number | number[]) => void;
}) {
  type ColumnTypes = Exclude<TableProps<FormListFieldData>["columns"], undefined>;

  const { viewport } = useGlobalContext();

  // Build dataSource from fields - use form context to get actual values
  const form = Form.useFormInstance();
  const handleDelete = useCallback(
    (index?: number) => {
      onRemove?.(index ?? 0);
    },
    [onRemove],
  );

  const handleCopy = useCallback(
    (index: number) => {
      const copied = form.getFieldValue([name, index]);
      onAdd?.(copied, index);
    },
    [form, name, onAdd],
  );

  const handleAdd = useCallback(() => {
    const emptyRow = newRowFactory({} as T);
    onAdd?.(emptyRow, 0);
  }, [newRowFactory, onAdd]);

  const ruleForDupes = useCallback(
    (column: JazzColumn) => {
      if (column.uniqueValues) {
        return {
          validator: (rule, value) => {
            const allRows: T[] = form.getFieldValue(name);
            const valsToCheck = map(allRows, (row) => "" + row[column.dataIndex as keyof T]);
            const indexOfValue = valsToCheck.indexOf(value);

            const hasDupes = some(valsToCheck, (item, index) => {
              return value === item && index !== indexOfValue;
            });
            return !hasDupes ? Promise.resolve() : Promise.reject(new Error("Doppelter Eintrag"));
          },
        } as ValidatorRule;
      }
    },
    [form, name],
  );

  const addButton = useMemo(() => {
    return (
      <ButtonWithIcon
        icon="PlusLg"
        onClick={handleAdd}
        style={{ paddingTop: 0, paddingBlock: 0, height: "initial" }}
        testid="add-in-table"
        tooltipTitle="Neue Zeile"
        type="text"
      />
    );
  }, [handleAdd]);

  const columns = useMemo(() => {
    const result: ColumnType<FormListFieldData>[] = map(columnDescriptions, (item) => {
      return {
        ...item,
        align: alignForType(item),
        render: (_: unknown, record: FormListFieldData, index: number) => (
          <EditableCell column={{ ...item }} index={index} uniqueRule={ruleForDupes(item)} usersWithKann={usersWithKann} />
        ),
        title: (
          <span>
            {item.title}&nbsp;
            {(item.editable ?? true) ? <EditOutlined style={{ color: "var(--ant-color-text-tertiary)" }} /> : undefined}
          </span>
        ),
      };
    });
    result.push({
      title: addButton,
      dataIndex: "operation",
      width: "70px",
      align: "end",
      render: (_: unknown, record: FormListFieldData, index: number) => (
        <InlineEditableActions
          actions={{
            delete: () => handleDelete(index),
            copy: () => handleCopy(index),
          }}
        />
      ),
    });
    return result;
  }, [addButton, columnDescriptions, handleCopy, handleDelete, ruleForDupes, usersWithKann]);

  const ref = useRef<Reference>(null);

  const [top, setTop] = useState(0);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTop(ref.current?.nativeElement?.getBoundingClientRect().top ?? 0);
  }, []);

  const scrollY = useMemo(() => {
    return fixedMinHeight || viewport.height - 50 - top;
  }, [viewport.height, fixedMinHeight, top]);

  return (
    <Table<FormListFieldData>
      bordered
      columns={columns as ColumnTypes}
      dataSource={fields}
      pagination={false}
      ref={ref}
      scroll={{ y: scrollY }}
      size="small"
      styles={{ body: { cell: { padding: 0, verticalAlign: "top" } }, header: { cell: {} } }}
    />
  );
}
