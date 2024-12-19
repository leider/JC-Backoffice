import React, { useContext, useEffect, useRef, useState } from "react";
import { Form } from "antd";
import TextInTable from "@/widgets/EditableTable/widgets/TextInTable.tsx";
import NumericInTable from "@/widgets/EditableTable/widgets/NumericInTable.tsx";
import { EditableContext } from "@/widgets/EditableTable/EditableContext.tsx";
import { AnyObject } from "antd/es/_util/type";
import { ColType } from "@/widgets/InlineCollectionEditable/types.ts";
import ColorInTable from "@/widgets/EditableTable/widgets/ColorInTable.tsx";
import DateInTable from "@/widgets/EditableTable/widgets/DateInTable.tsx";
import { InnerSelect, UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import { useTableContext } from "@/widgets/EditableTable/useTableContext.ts";
import { NamePath } from "rc-field-form/es/interface";

interface EditableCellProps<T> extends ExtraColumnProps {
  title: React.ReactNode;
  record: T;
  handleSave: (record: T) => void;
}

export type ExtraColumnProps = {
  editable?: boolean;
  dataIndex: NamePath;
  type?: ColType;
  required?: boolean;
  usersWithKann?: UserWithKann[];
};

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
  usersWithKann,
  ...restProps
}: React.PropsWithChildren<EditableCellProps<RecordType>>) => {
  const [editing, setEditing] = useState(false);
  const { endEdit } = useTableContext();

  const ref = useRef<any>(null);
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
      handleSave({ ...record, ...values });
    } catch {
      /* empty */
    }
  };
  if (!editable) {
    return <td {...restProps}>{children}</td>;
  }

  const toggleEdit = () => {
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
  };

  let Widget;
  switch (type) {
    case "integer":
      Widget = <NumericInTable ref={ref} decimals={0} save={save} />;
      break;
    case "color":
      Widget = <ColorInTable save={save} />;
      break;
    case "date":
      Widget = <DateInTable ref={ref} save={save} />;
      break;
    case "user":
      Widget = <InnerSelect usersAsOptions={usersWithKann ?? []} save={save} />;
      break;
    default:
      Widget = <TextInTable ref={ref} save={save} />;
      break;
  }

  const childNode = !editing ? (
    <div
      tabIndex={0}
      onFocus={type !== "color" ? toggleEdit : undefined}
      onClick={toggleEdit}
      style={{ width: type === "color" ? 20 : undefined }}
    >
      {children}
    </div>
  ) : (
    <Form.Item style={{ margin: 0 }} name={dataIndex as string} rules={[{ required }]}>
      {Widget}
    </Form.Item>
  );

  return <td {...restProps}>{childNode}</td>;
};

export default EditableCell;
