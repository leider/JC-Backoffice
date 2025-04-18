import { Form, Table, type TableProps, Typography } from "antd";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { EditableContext } from "@/widgets/EditableTable/EditableContext.tsx";
import EditableCell from "@/widgets/EditableTable/widgets/EditableCell.tsx";
import { TableContext, useCreateTableContext } from "@/widgets/EditableTable/useTableContext.ts";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import InlineEditableActions from "@/widgets/EditableTable/InlineEditableActions.tsx";
import cloneDeep from "lodash/cloneDeep";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import "./editableTable.css";
import { Columns } from "./types";
import useColumnRenderer from "@/widgets/EditableTable/widgets/useColumnRenderer.tsx";
import findIndex from "lodash/findIndex";
import find from "lodash/find";
import map from "lodash/map";
import reject from "lodash/reject";
import flatMap from "lodash/flatMap";
import keys from "lodash/keys";
import { GlobalContext } from "@/app/GlobalContext.ts";

export type WithKey<T> = T & { key: string };

function DulicatesInfo({ duplInfo }: { readonly duplInfo: DuplInfo }) {
  if (keys(duplInfo).length === 0) {
    return undefined;
  }
  return (
    <>
      <Typography.Text type="danger">Du hast doppelte Einträge!</Typography.Text>
      <ul>
        {map(duplInfo, (info) => (
          <li>
            <b>{info.name}:</b> {info.vals}
          </li>
        ))}
      </ul>
    </>
  );
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

export type DuplInfo = { name: string; vals: string[]; keys: string[] }[];

export default function EditableTableInner<T>({
  value,
  onTable,
  columnDescriptions,
  usersWithKann,
  newRowFactory,
  duplInfo,
  requiredErrors,
  fixedMinHeight,
}: {
  readonly value?: T[];
  readonly onTable?: (val?: T[]) => void;
  readonly columnDescriptions?: Columns[];
  readonly usersWithKann?: UserWithKann[];
  readonly newRowFactory: (val: T) => T;
  readonly duplInfo: DuplInfo;
  readonly requiredErrors: string[];
  readonly fixedMinHeight?: number;
}) {
  type TWithKey = WithKey<T>;
  type ColumnTypes = Exclude<TableProps<TWithKey>["columns"], undefined>;
  const [rows, setRows] = useState<TWithKey[]>([]);
  const tableContext = useCreateTableContext();
  const { viewport } = useContext(GlobalContext);

  useEffect(() => {
    const withKey: TWithKey[] = map(value, (row, index) => {
      (row as TWithKey).key = "row" + index;
      return row as TWithKey;
    });
    setRows(withKey);
  }, [value]);

  const newKey = useCallback(() => {
    const numbers = map(rows, (row) => Number.parseInt(row.key.replace("key", ""), 10));
    return Math.max(...numbers) + 1;
  }, [rows]);

  const handleDelete = useCallback(
    (key: React.Key) => {
      onTable?.(reject(rows, ["key", key]));
    },
    [onTable, rows],
  );

  const handleCopy = useCallback(
    (key: React.Key) => {
      if (!rows) {
        return;
      }
      const current = find(rows, { key: key }) as WithKey<T>;
      if (!current) {
        return;
      }
      const copied = cloneDeep(current);
      copied.key = "" + newKey();
      const clone = cloneDeep(rows);
      clone.splice(rows.indexOf(current), 0, copied);
      onTable?.(clone);
    },
    [newKey, onTable, rows],
  );

  const handleAdd = useCallback(() => {
    const newData = newRowFactory({} as T);
    (newData as TWithKey).key = "" + newKey();
    onTable?.([newData, ...rows]);
  }, [newKey, newRowFactory, onTable, rows]);

  const handleSave = useCallback(
    (row: TWithKey, field: object) => {
      const newData = [...(rows ?? [])];
      const index = findIndex(newData, ["key", row.key]);
      const newRow = newRowFactory({ ...row, ...field });
      (newRow as TWithKey).key = row.key;
      newData.splice(index, 1, newRow as TWithKey);
      onTable?.(newData);
    },
    [newRowFactory, onTable, rows],
  );

  const hasRecordErrors = useCallback(
    (record: TWithKey) => flatMap(map(duplInfo, "keys")).includes(record.key) || requiredErrors.includes(record.key),
    [duplInfo, requiredErrors],
  );

  const renderByType = useColumnRenderer(usersWithKann);

  const defaultColumns = useMemo(() => {
    const result = map(columnDescriptions, (item, index) => {
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
        multiline: item.multiline,
      };
    });
    result.push({
      title: (
        <ButtonWithIcon
          icon="PlusLg"
          onClick={handleAdd}
          style={{ paddingTop: 0, paddingBlock: 0, height: "initial" }}
          testid="add-in-table"
          tooltipTitle="Neue Zeile"
          type="text"
        />
      ),
      dataIndex: "operation",
      width: "70px",
      align: "end",
      // @ts-expect-error I do not know why this is bad here
      render: (_: unknown, record: TWithKey) => (
        <InlineEditableActions actions={{ delete: () => handleDelete(record.key), copy: () => handleCopy(record.key) }} />
      ),
    });
    return result;
  }, [columnDescriptions, handleAdd, handleCopy, handleDelete, renderByType, usersWithKann]);

  const columns = useMemo(
    () =>
      map(defaultColumns, (col) => {
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
            multiline: col.multiline,
          }),
        };
      }),
    [defaultColumns, handleSave, rows],
  );

  const ref: Parameters<typeof Table>[0]["ref"] = React.useRef(null);

  const scrollY = useMemo(
    () => (fixedMinHeight ? fixedMinHeight : viewport.height - 50 - (ref?.current?.nativeElement.getBoundingClientRect().top ?? 0)),
    [viewport.height, ref?.current?.nativeElement], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div>
      <TableContext.Provider value={tableContext}>
        <DulicatesInfo duplInfo={duplInfo} />
        <Table<TWithKey>
          bordered
          className="editable-table"
          columns={columns as ColumnTypes}
          components={{ body: { row: EditableRow, cell: EditableCell } }}
          dataSource={rows}
          pagination={false}
          ref={ref}
          rowClassName={(record) => (hasRecordErrors(record) ? "table-row-error" : "")}
          scroll={{ y: scrollY }}
          size="small"
        />
      </TableContext.Provider>
    </div>
  );
}
