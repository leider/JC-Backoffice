import React, { useContext, useEffect, useRef, useState } from "react";
import { EditableContext } from "@/widgets/EditableTable/EditableContext.tsx";
import { AnyObject } from "antd/es/_util/type";
import { ColType } from "@/widgets/InlineCollectionEditable/types.ts";
import MitarbeiterMultiSelect, { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import { useTableContext } from "@/widgets/EditableTable/useTableContext.ts";
import { NamePath } from "rc-field-form/es/interface";
import { ColorField } from "@/widgets/ColorField.tsx";
import { NumberInput } from "@/widgets/numericInputWidgets";
import DateInput from "@/widgets/DateAndTimeInputs.tsx";
import { TextField } from "@/widgets/TextField.tsx";

interface EditableCellProps<T> extends ExtraColumnProps {
  title: React.ReactNode;
  record: T;
  handleSave: (record: T, field: any) => void;
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
      handleSave(record, values);
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

  const childNode = !editing ? (
    <div
      tabIndex={0}
      onFocus={type !== "color" ? toggleEdit : undefined}
      onClick={toggleEdit}
      style={{ width: type === "color" ? 20 : undefined }}
    >
      {children}
    </div>
  ) : type === "user" ? (
    <MitarbeiterMultiSelect name={dataIndex} usersAsOptions={usersWithKann ?? []} save={save} focus />
  ) : type === "color" ? (
    <ColorField name={dataIndex} save={save} required={required} />
  ) : type === "integer" ? (
    <NumberInput decimals={0} name={dataIndex} required={required} save={save} focus />
  ) : type === "date" ? (
    <DateInput name={dataIndex} required={required} save={save} focus />
  ) : (
    <TextField name={dataIndex} required={required} save={save} focus />
    // <Form.Item style={{ margin: 0 }} name={dataIndex} rules={[{ required }]}>
    //   {Widget}
    // </Form.Item>
  );
  return <td {...restProps}>{childNode}</td>;
};

export default EditableCell;
