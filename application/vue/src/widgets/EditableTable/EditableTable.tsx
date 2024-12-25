import { Form, Table, type TableProps, Tag, theme, Typography } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EditableContext } from "@/widgets/EditableTable/EditableContext.tsx";
import numeral from "numeral";
import dayjs from "dayjs";
import { TagForUser } from "@/widgets/TagForUser.tsx";
import EditableCell from "@/widgets/EditableTable/widgets/EditableCell.tsx";
import { TableContext, useCreateTableContext } from "@/widgets/EditableTable/useTableContext.ts";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import { NamePath, ValidatorRule } from "rc-field-form/es/interface";
import InlineEditableActions from "@/widgets/EditableTable/InlineEditableActions.tsx";
import cloneDeep from "lodash/cloneDeep";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import isNil from "lodash/isNil";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import "./editableTable.css";
import { Columns } from "./types";

type WithKey<T> = T & { key: string };

interface EditableTableProps<T> {
  name: NamePath;
  columnDescriptions: Columns[];
  usersWithKann?: UserWithKann[];
  newRowFactory: (vals: T) => T;
}

interface EditableRowProps {
  index: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

function InnerTable<T>({
  value,
  onChange,
  columnDescriptions,
  usersWithKann,
  newRowFactory,
}: {
  value?: T[];
  onChange?: (val?: T[]) => void;
  columnDescriptions?: Columns[];
  usersWithKann?: UserWithKann[];
  newRowFactory: (val: T) => T;
}) {
  type TWithKey = WithKey<T>;
  type ColumnTypes = Exclude<TableProps<TWithKey>["columns"], undefined>;
  const token = theme.useToken().token;
  const [rows, setRows] = useState<TWithKey[]>([]);

  useEffect(() => {
    const withKey: TWithKey[] = (value ?? []).map((row, index) => {
      (row as TWithKey).key = "row" + index;
      return row as TWithKey;
    });
    setRows(withKey);
  }, [value]);

  function newKey() {
    const numbers = rows.map((row) => Number.parseInt(row.key.replace("key", ""), 10));
    return Math.max(...numbers) + 1;
  }

  const handleDelete = (key: React.Key) => {
    const newData = rows?.filter((item) => item.key !== key);
    onChange?.(newData);
  };

  const handleCopy = (key: React.Key) => {
    if (!rows) {
      return;
    }
    const current = rows.find((item) => item.key === key);
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

  const handleSave = (row: TWithKey, field: any) => {
    const newData = [...(rows ?? [])];
    const index = newData.findIndex((item) => row.key === item.key);
    const newRow = newRowFactory({ ...row, ...field });
    (newRow as TWithKey).key = row.key;
    newData.splice(index, 1, newRow as TWithKey);
    onChange?.(newData);
  };

  const renderByType = useCallback(
    function ({ type, required }: Columns) {
      switch (type) {
        case "boolean":
          return (val: boolean) =>
            val ? (
              <IconForSmallBlock iconName="CheckSquareFill" color={token.colorSuccess} />
            ) : (
              <IconForSmallBlock iconName="Square" color={token.colorFillSecondary} />
            );
        case "integer":
          return (val: number | null) => {
            if (!isNil(val)) {
              return numeral(val).format("0");
            }
            if (required) {
              return <Typography.Text type="danger"> Wert eingeben</Typography.Text>;
            }
            return "0";
          };
        case "color":
          return (val: string | null) => {
            if (isNil(val) && required) {
              return <IconForSmallBlock size="20" iconName="SlashSquare" color={token.colorError} />;
            }
            return val ? (
              <div style={{ backgroundColor: val, width: 20, height: 20 }} />
            ) : (
              <IconForSmallBlock size="20" iconName="SlashSquare" color={token.colorPrimary} />
            );
          };
        case "date":
          return (val: string | null) => {
            if (!isNil(val)) {
              return dayjs(val).format("ll");
            }
            if (required) {
              return <Typography.Text type="danger"> Wert eingeben</Typography.Text>;
            }
            return "<Klick ...>";
          };
        case "startEnd":
          return (val: string[] | null) => {
            if (!isNil(val)) {
              return dayjs(val[0]).format("ll") + " - " + dayjs(val[1]).format("ll");
            }
            if (required) {
              return <Typography.Text type="danger"> Wert eingeben</Typography.Text>;
            }
            return "<Klick ...>";
          };
        case "user":
          return (val: string[] | null) => {
            if (isNil(val) || val.length === 0) {
              if (required) {
                return <Typography.Text type="danger"> Wert eingeben</Typography.Text>;
              }
              return "Noch niemand gewählt...";
            }
            return (
              <>
                {val.map((each) => (
                  <Tag key={each}>
                    <TagForUser value={each} usersAsOptions={usersWithKann ?? []} hideErsthelfer />
                  </Tag>
                ))}
              </>
            );
          };
        default:
          return (val: string | null) => {
            if (val) {
              return val;
            }
            if (required) {
              return <Typography.Text type="danger"> Wert eingeben</Typography.Text>;
            }
            return "<Klick ...>";
          };
      }
    },
    [token, usersWithKann],
  );

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

  const defaultColumns: (Omit<ColumnTypes[number], "filters"> & Columns)[] = (columnDescriptions ?? []).map((item, index) => {
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
      type="text"
      icon="PlusLg"
      tooltipTitle="Neue Zeile"
      onClick={handleAdd}
      style={{ paddingTop: 0, paddingBlock: 0, height: "initial" }}
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

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: T) => ({
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
        className={"editable-table"}
        components={components}
        bordered
        dataSource={rows}
        columns={columns as ColumnTypes}
        size="small"
        pagination={false}
      />
    </TableContext.Provider>
  );
}

export default function EditableTable<T>({ name, columnDescriptions, usersWithKann, newRowFactory }: EditableTableProps<T>) {
  const requiredFields = useMemo(() => columnDescriptions.filter((desc) => desc.required), [columnDescriptions]);

  const requiredValidator = useMemo(() => {
    return {
      validator: (_, value: T[]) => {
        let broken = false;
        value.forEach((row) => {
          requiredFields.forEach((field) => {
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

  function duplicates(values: any[]) {
    return values.filter((item, index) => index !== values.indexOf(item));
  }

  const uniqueFields = useMemo(() => columnDescriptions.filter((desc) => desc.uniqueValues), [columnDescriptions]);

  const uniqueValidator = useMemo(() => {
    return {
      validator: (_, value: T[]) => {
        let broken = false;
        uniqueFields.forEach((field) => {
          const valsToCheck = value.map((row) => row[field.dataIndex as keyof T]);
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
      valuePropName="value"
      trigger="onChange"
      rules={[requiredFields && requiredValidator, uniqueValidator && uniqueValidator]}
    >
      <InnerTable<T> columnDescriptions={columnDescriptions} usersWithKann={usersWithKann} newRowFactory={newRowFactory} />
    </Form.Item>
  );
}
