import { Form, Table, type TableProps } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { EditableContext } from "@/widgets/EditableTable/EditableContext.tsx";
import EditableCell from "@/widgets/EditableTable/widgets/EditableCell.tsx";
import { TableContext, useCreateTableContext } from "@/widgets/EditableTable/useTableContext.ts";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import { NamePath, ValidatorRule } from "rc-field-form/es/interface";
import InlineEditableActions from "@/widgets/EditableTable/InlineEditableActions.tsx";
import cloneDeep from "lodash/cloneDeep";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import isNil from "lodash/isNil";
import "./editableTable.css";
import { Columns } from "./types";
import useColumnRenderer from "@/widgets/EditableTable/widgets/useColumnRenderer.tsx";
import findIndex from "lodash/findIndex";
import find from "lodash/find";
import map from "lodash/map";
import forEach from "lodash/forEach";
import reject from "lodash/reject";
import filter from "lodash/filter";

type WithKey<T> = T & { key: string };

interface EditableTableProps<T> {
  readonly name: NamePath;
  readonly columnDescriptions: Columns[];
  readonly usersWithKann?: UserWithKann[];
  readonly newRowFactory: (vals: T) => T;
}

function EditableRow(props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>) {
  const [form] = Form.useForm();
  return (
    <Form component={false} form={form}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
}

function InnerTable<T>({
  value,
  onChange,
  columnDescriptions,
  usersWithKann,
  newRowFactory,
}: {
  readonly value?: T[];
  readonly onChange?: (val?: T[]) => void;
  readonly columnDescriptions?: Columns[];
  readonly usersWithKann?: UserWithKann[];
  readonly newRowFactory: (val: T) => T;
}) {
  type TWithKey = WithKey<T>;
  type ColumnTypes = Exclude<TableProps<TWithKey>["columns"], undefined>;
  const [rows, setRows] = useState<TWithKey[]>([]);

  useEffect(() => {
    const withKey: TWithKey[] = map(value, (row, index) => {
      (row as TWithKey).key = "row" + index;
      return row as TWithKey;
    });
    setRows(withKey);
  }, [value]);

  function newKey() {
    const numbers = map(rows, (row) => Number.parseInt(row.key.replace("key", ""), 10));
    return Math.max(...numbers) + 1;
  }

  const handleDelete = (key: React.Key) => {
    onChange?.(reject(rows, ["key", key]));
  };

  const handleCopy = (key: React.Key) => {
    if (!rows) {
      return;
    }
    const current = find(rows, { key: key }) as WithKey<T>;
    if (!current) {
      return;
    }
    const copied = cloneDeep(current);
    copied.key = "" + newKey();
    rows.splice(rows.indexOf(current), 0, copied);
    onChange?.(rows);
  };

  const handleAdd = () => {
    const newData = newRowFactory({} as T);
    (newData as TWithKey).key = "" + newKey();
    onChange?.([newData, ...rows]);
  };

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const handleSave = (row: TWithKey, field: any) => {
    const newData = [...(rows ?? [])];
    const index = findIndex(newData, ["key", row.key]);
    const newRow = newRowFactory({ ...row, ...field });
    (newRow as TWithKey).key = row.key;
    newData.splice(index, 1, newRow as TWithKey);
    onChange?.(newData);
  };

  const renderByType = useColumnRenderer(usersWithKann);

  function widthForType({ width, type }: Columns) {
    if (width) {
      return width;
    }
    switch (type) {
      case "integer":
        return "60px";
      case "color":
        return "45px";
      case "date":
        return "100px";
      case "startEnd":
        return "200px";
    }
  }

  const defaultColumns: (Omit<ColumnTypes[number], "filters"> & Columns)[] = map(columnDescriptions, (item, index) => {
    return {
      editable: item.editable ?? true,
      dataIndex: item.dataIndex,
      title: item.title,
      type: item.type,
      index: index,
      required: item.required,
      filters: item.filters,
      presets: item.presets,
      usersWithKann: usersWithKann,
      render: renderByType(item),
      align: item.type === "integer" ? "end" : item.type === "boolean" ? "center" : "start",
      onCell: undefined,
      width: widthForType(item),
      min: item.min,
      initialValue: item.initialValue,
    };
  });

  const addButton = (
    <ButtonWithIcon
      icon="PlusLg"
      onClick={handleAdd}
      style={{ paddingTop: 0, paddingBlock: 0, height: "initial" }}
      testid="add-in-table"
      tooltipTitle="Neue Zeile"
      type="text"
    />
  );
  defaultColumns.push({
    title: addButton,
    dataIndex: "operation",
    width: "70px",
    align: "end",
    render: (_: unknown, record: TWithKey) => (
      <InlineEditableActions actions={{ delete: () => handleDelete(record.key), copy: () => handleCopy(record.key) }} />
    ),
  });

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(defaultColumns, (col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      filters: undefined, // disable filter dropdown
      onCell: (record: TWithKey) => ({
        index: rows.indexOf(record),
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
        type: col.type,
        required: col.required,
        presets: col.presets,
        filters: col.filters,
        usersWithKann: col.usersWithKann,
        width: col.width,
        min: col.min,
        initialValue: col.initialValue,
      }),
    };
  });

  const tableContext = useCreateTableContext();
  return (
    <TableContext.Provider value={tableContext}>
      <Table<TWithKey>
        bordered
        className="editable-table"
        columns={columns as ColumnTypes}
        components={components}
        dataSource={rows}
        pagination={{ position: ["topRight"], defaultPageSize: 50, hideOnSinglePage: true }}
        size="small"
      />
    </TableContext.Provider>
  );
}

export default function EditableTable<T>({ name, columnDescriptions, usersWithKann, newRowFactory }: EditableTableProps<T>) {
  const requiredFields = useMemo(() => filter(columnDescriptions, "required"), [columnDescriptions]);

  const requiredValidator = useMemo(() => {
    return {
      validator: (_, value: T[]) => {
        let broken = false;
        forEach(value, (row) => {
          forEach(requiredFields, (field) => {
            if (isNil(row[field.dataIndex as keyof T])) {
              broken = true;
            }
          });
        });
        return broken ? Promise.reject(new Error()) : Promise.resolve();
      },
      message: "Du musst alle Pflichtfelder füllen",
    } as ValidatorRule;
  }, [requiredFields]);

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  function duplicates(values: any[]) {
    return filter(values, (item, index) => index !== values.indexOf(item));
  }

  const uniqueFields = useMemo(() => filter(columnDescriptions, "uniqueValues"), [columnDescriptions]);

  const uniqueValidator = useMemo(() => {
    return {
      validator: (_, value: T[]) => {
        let broken = false;
        forEach(uniqueFields, (field) => {
          const valsToCheck = map(value, (row) => row[field.dataIndex as keyof T]);
          if (duplicates(valsToCheck).length) {
            broken = true;
          }
        });
        return broken ? Promise.reject(new Error()) : Promise.resolve();
      },
      message: "Prüfe alle Felder auf Duplikate",
    } as ValidatorRule;
  }, [uniqueFields]);

  return (
    <Form.Item
      name={name}
      rules={[requiredFields && requiredValidator, uniqueFields && uniqueValidator]}
      trigger="onChange"
      valuePropName="value"
    >
      <InnerTable<T> columnDescriptions={columnDescriptions} newRowFactory={newRowFactory} usersWithKann={usersWithKann} />
    </Form.Item>
  );
}
