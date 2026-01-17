import { Alert, ConfigProvider, Form, FormListFieldData, Table, type TableProps } from "antd";
import React, { useCallback, useMemo } from "react";
import EditableCell, { EditableCellProps } from "@/widgets/EditableTable/widgets/EditableCell.tsx";
import { TableContext, useCreateTableContext } from "@/widgets/EditableTable/useTableContext.ts";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import InlineEditableActions from "@/widgets/EditableTable/InlineEditableActions.tsx";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import "./editableTable.css";
import { JazzColumn } from "./types";
import useColumnRenderer from "@/widgets/EditableTable/widgets/useColumnRenderer.tsx";
import map from "lodash/map";
import flatMap from "lodash/flatMap";
import keys from "lodash/keys";
import { useGlobalContext } from "@/app/GlobalContext.ts";
import { ColumnType } from "antd/es/table/interface";
import type { NamePath } from "antd/es/form/interface";
import type { StoreValue } from "@rc-component/form/lib/interface";

export type WithKey<T> = T & { key: string };

function DuplicatesDetails({ duplInfo }: { readonly duplInfo: DuplInfo }) {
  return map(duplInfo, (info) => (
    <li>
      <b>{info.name}:</b> {info.vals.join(", ")}
    </li>
  ));
}

function DulicatesInfo({ duplInfo }: { readonly duplInfo: DuplInfo }) {
  if (keys(duplInfo).length === 0) {
    return undefined;
  }
  return (
    <ConfigProvider theme={{ components: { Alert: { withDescriptionPadding: "10px" } } }}>
      <Alert description={<DuplicatesDetails duplInfo={duplInfo} />} message="Du hast doppelte Einträge!" showIcon type="error" />
    </ConfigProvider>
  );
}

function widthForType({ width, type }: JazzColumn) {
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

function alignForType(item: JazzColumn) {
  switch (item.type) {
    case "integer":
      return "end";
    case "boolean":
      return "center";
    default:
      return "start";
  }
}

export type DuplInfo = { name: string; vals: string[]; keys: string[] }[];

export default function EditableTableInner<T>({
  fields,
  columnDescriptions,
  usersWithKann,
  newRowFactory,
  duplInfo,
  requiredErrors,
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
  readonly duplInfo: DuplInfo;
  readonly requiredErrors: string[];
  readonly fixedMinHeight?: number;
  readonly onAdd?: (defaultValue?: StoreValue, insertIndex?: number) => void;
  readonly onRemove?: (index: number | number[]) => void;
}) {
  type TWithKey = WithKey<T>;
  type ColumnTypes = Exclude<TableProps<FormListFieldData>["columns"], undefined>;

  const tableContext = useCreateTableContext();
  const { viewport } = useGlobalContext();

  // Build dataSource from fields - use form context to get actual values
  const form = Form.useFormInstance();
  const handleDelete = useCallback(
    (key: React.Key, fieldIndex?: number) => {
      onRemove?.(fieldIndex ?? 0);
    },
    [onRemove],
  );

  const handleCopy = useCallback(
    (row: TWithKey, index: number) => {
      const copied = form.getFieldValue([name, index]);
      onAdd?.(copied, index);
    },
    [form, name, onAdd],
  );

  const handleAdd = useCallback(() => {
    const emptyRow = newRowFactory({} as T);
    // Form.List add() handles empty object insertion
    onAdd?.(emptyRow, 0);
  }, [newRowFactory, onAdd]);

  const renderByType = useColumnRenderer(usersWithKann);

  const shouldCellUpdate = useCallback((record: TWithKey, prevRecord: TWithKey) => record !== prevRecord, []);

  const defaultColumns = useMemo(() => {
    const result: (JazzColumn & ColumnType<TWithKey>)[] = map(columnDescriptions, (item) => ({
      ...item,
      editable: item.editable ?? true,
      usersWithKann,
      render: renderByType(item),
      align: alignForType(item),
      width: widthForType(item),
      //shouldCellUpdate,
    }));

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
      shouldCellUpdate,
      render: (_: unknown, record: TWithKey, index: number) => (
        <InlineEditableActions
          actions={{
            delete: () => handleDelete(record.key, index),
            copy: () => handleCopy(record, index),
          }}
        />
      ),
    });
    return result;
  }, [columnDescriptions, handleAdd, handleDelete, handleCopy, renderByType, shouldCellUpdate, usersWithKann]);

  type Override<T, R> = Omit<T, keyof R> & R;
  const columns: Override<
    ColumnType<TWithKey>,
    {
      onCell?: (record: TWithKey, index?: number) => Partial<EditableCellProps<TWithKey>>;
    }
  >[] = useMemo(
    () =>
      map(defaultColumns, (col) => {
        if (!col.editable) {
          return { ...col, onCell: undefined };
        }
        return {
          ...col,

          // PERFORMANCE CHANGE 2: use antd-provided index instead of rows.indexOf(record) [web:2]
          onCell: (record: TWithKey, index?: number) => {
            const result: EditableCellProps<TWithKey> = {
              name,
              index: index ?? 0,
              record,
              column: col,
            };
            return result;
          },
        };
      }),
    [defaultColumns, name],
  );

  const ref = React.useRef<any>(null);
  const scrollY = useMemo(
    () => fixedMinHeight || viewport.height - 50 - (ref.current?.nativeElement?.getBoundingClientRect().top ?? 0),
    [viewport.height, fixedMinHeight, ref],
  );

  return (
    <div>
      <TableContext.Provider value={tableContext}>
        <DulicatesInfo duplInfo={duplInfo} />
        <Table<FormListFieldData>
          bordered
          className="editable-table"
          columns={columns as ColumnTypes}
          components={{ body: { cell: EditableCell } }}
          dataSource={fields}
          pagination={false}
          ref={ref}
          scroll={{ y: scrollY }}
          size="small"
        />
      </TableContext.Provider>
    </div>
  );
}
