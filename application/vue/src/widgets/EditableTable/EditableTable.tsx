import { Form, Table, type TableProps, Tag, Typography } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EditableContext } from "@/widgets/EditableTable/EditableContext.tsx";
import { CollectionColDesc } from "@/widgets/InlineCollectionEditable";
import numeral from "numeral";
import dayjs from "dayjs";
import { TagForUser } from "@/widgets/TagForUser.tsx";
import EditableCell, { ExtraColumnProps } from "@/widgets/EditableTable/widgets/EditableCell.tsx";
import { TableContext, useCreateTableContext } from "@/widgets/EditableTable/useTableContext.ts";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import { NamePath } from "rc-field-form/es/interface";
import InlineEditableActions from "@/widgets/InlineCollectionEditable/InlineEditableActions.tsx";
import cloneDeep from "lodash/cloneDeep";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import isNil from "lodash/isNil";

interface EditableTableProps {
  name: NamePath;
  columnDescriptions: CollectionColDesc[];
  usersWithKann?: UserWithKann[];
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
}: {
  value?: T[];
  onChange?: (val?: T[]) => void;
  columnDescriptions?: CollectionColDesc[];
  usersWithKann?: UserWithKann[];
}) {
  type ColumnTypes = Exclude<TableProps<T & { key: React.Key }>["columns"], undefined>;

  const [valueWithKey, setValueWithKey] = useState<(T & { key: React.Key })[] | undefined>();

  useEffect(() => {
    const withKey: (T & { key: React.Key })[] = (value ?? []).map((row, index) => {
      (row as T & { key: React.Key }).key = "" + index;
      return row as T & { key: React.Key };
    });
    setValueWithKey(withKey);
  }, [value]);

  const handleDelete = (key: React.Key) => {
    const newData = valueWithKey?.filter((item) => item.key !== key);
    onChange?.(newData);
  };

  const handleCopy = (key: React.Key) => {
    if (!valueWithKey) {
      return;
    }
    const current = valueWithKey.find((item) => item.key === key);
    if (!current) {
      return;
    }
    const copied = cloneDeep(current);
    valueWithKey.splice(valueWithKey.indexOf(current), 0, copied);
    onChange?.(valueWithKey);
  };

  const handleAdd = () => {
    const newData: T = {} as unknown as T;
    onChange?.([newData, ...(valueWithKey ?? [])]);
  };

  const renderByType = useCallback(
    function ({ type, required }: CollectionColDesc) {
      switch (type) {
        case "integer":
          return (val: number | null) => {
            if (val) {
              return numeral(val).format("0");
            }
            if (required) {
              return <Typography.Text type="danger"> Wert eingeben</Typography.Text>;
            }
            return "0";
          };
        case "color":
          return (val: string | null) => {
            if (!val && required) {
              return <Typography.Text type="danger"> Wert eingeben</Typography.Text>;
            }
            return <div style={{ backgroundColor: val ?? "#333333", width: 20, height: 20 }} />;
          };
        case "date":
          return (val: string | null) => {
            if (val) {
              return dayjs(val).format("ll");
            }
            if (required) {
              return <Typography.Text type="danger"> Wert eingeben</Typography.Text>;
            }
            return "<Klick ...>";
          };
        case "user":
          return (val: string[] | null) => {
            if (!val || val.length === 0) {
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
    [usersWithKann],
  );

  const defaultColumns: (ColumnTypes[number] & ExtraColumnProps)[] = (columnDescriptions ?? []).map((item, index) => {
    return {
      editable: !item.disabled,
      dataIndex: item.fieldName,
      title: item.label,
      type: item.type,
      index: index,
      required: item.required,
      usersWithKann: usersWithKann,
      render: renderByType(item),
      align: item.type === "integer" ? "end" : "start",
    };
  });

  const addButton = (
    <ButtonWithIcon
      size="small"
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
    width: 70,
    align: "end",
    render: (_: unknown, record: T & { key: React.Key }) => (
      <InlineEditableActions actions={{ delete: () => handleDelete(record.key), copy: () => handleCopy(record.key) }} />
    ),
  });

  const handleSave = (row: T & { key: React.Key }) => {
    const newData = [...(valueWithKey ?? [])];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    onChange?.(newData);
  };

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
        usersWithKann: col.usersWithKann,
      }),
    };
  });

  const tableContext = useCreateTableContext();
  return (
    <TableContext.Provider value={tableContext}>
      <Table<T & { key: React.Key }>
        components={components}
        bordered
        dataSource={valueWithKey}
        columns={columns as ColumnTypes}
        size="small"
        pagination={false}
      />
    </TableContext.Provider>
  );
}

export default function EditableTable<T>({ name, columnDescriptions, usersWithKann }: EditableTableProps) {
  const requiredFields = useMemo(() => columnDescriptions.filter((desc) => desc.required), [columnDescriptions]);
  return (
    <Form.Item
      name={name}
      valuePropName="value"
      trigger="onChange"
      hasFeedback
      rules={[
        () => ({
          validator(_, value) {
            let broken = false;
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            value.forEach((row: any) => {
              requiredFields.forEach((field) => {
                if (isNil(row[field.fieldName as string])) {
                  broken = true;
                }
              });
            });
            return broken ? Promise.reject(new Error("Du musst alle Pflichtfelder füllen")) : Promise.resolve();
          },
        }),
      ]}
    >
      <InnerTable<T> columnDescriptions={columnDescriptions} usersWithKann={usersWithKann} />
    </Form.Item>
  );
}
