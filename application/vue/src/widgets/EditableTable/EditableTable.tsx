import { Form } from "antd";
import React from "react";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import { NamePath } from "antd/es/form/interface";
import { JazzColumn } from "./types";
import EditableTableInner from "@/widgets/EditableTable/EditableTableInner.tsx";

interface EditableTableProps<T> {
  readonly name: NamePath;
  readonly columnDescriptions: JazzColumn[];
  readonly usersWithKann?: UserWithKann[];
  readonly newRowFactory: (vals: T) => T;
  readonly fixedMinHeight?: number;
}

export default function EditableTable<T>({
  name,
  columnDescriptions,
  usersWithKann,
  newRowFactory,
  fixedMinHeight,
}: EditableTableProps<T>) {
  return (
    <Form.List name={name}>
      {(fields, { add, remove }, { errors }) => {
        return (
          <>
            <EditableTableInner<T>
              columnDescriptions={columnDescriptions}
              fields={fields}
              fixedMinHeight={fixedMinHeight}
              name={name}
              newRowFactory={newRowFactory}
              onAdd={add}
              onRemove={remove}
              usersWithKann={usersWithKann}
            />
            <Form.ErrorList errors={errors} />
          </>
        );
      }}
    </Form.List>
  );
}
