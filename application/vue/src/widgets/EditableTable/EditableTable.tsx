import { Form } from "antd";
import React, { useMemo, useState } from "react";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import { NamePath, ValidatorRule } from "rc-field-form/es/interface";
import isNil from "lodash/isNil";
import "./editableTable.css";
import { Columns } from "./types";
import map from "lodash/map";
import forEach from "lodash/forEach";
import filter from "lodash/filter";
import compact from "lodash/compact";
import uniq from "lodash/uniq";
import EditableTableInner, { DuplInfo, WithKey } from "@/widgets/EditableTable/EditableTableInner.tsx";

interface EditableTableProps<T> {
  readonly name: NamePath;
  readonly columnDescriptions: Columns[];
  readonly usersWithKann?: UserWithKann[];
  readonly newRowFactory: (vals: T) => T;
  readonly fixedMinHeight?: number;
}

function duplicates(values: string[]) {
  const compacted = compact(values);
  return filter(compacted, (item, index) => index !== compacted.indexOf(item));
}

export default function EditableTable<T>({
  name,
  columnDescriptions,
  usersWithKann,
  newRowFactory,
  fixedMinHeight,
}: EditableTableProps<T>) {
  const requiredFields = useMemo(() => map(filter(columnDescriptions, "required"), "dataIndex") as string[], [columnDescriptions]);
  const uniqueFields = useMemo(() => filter(columnDescriptions, "uniqueValues"), [columnDescriptions]);
  const [duplInfo, setDuplInfo] = useState<DuplInfo>([]);
  const [requiredErrors, setRequiredErrors] = useState<string[]>([]);

  const requiredValidator = useMemo(() => {
    return {
      validator: (_, rows: WithKey<T>[]) => {
        const broken: string[] = [];
        forEach(requiredFields, (field) => {
          forEach(rows, (row) => {
            const val = row[field as keyof T];
            if (isNil(val) || val === "") {
              broken.push(row.key);
            }
          });
        });
        setRequiredErrors(broken);
        return broken.length ? Promise.reject(new Error()) : Promise.resolve();
      },
      message: "Du musst alle Pflichtfelder füllen",
    } as ValidatorRule;
  }, [requiredFields]);

  const uniqueValidator = useMemo(() => {
    return {
      validator: (_, value: T[]) => {
        let broken = false;
        const details: DuplInfo = [];
        forEach(uniqueFields, (field) => {
          const valsToCheck = map(value, (row) => "" + row[field.dataIndex as keyof T]);
          const dupes = duplicates(valsToCheck);
          const keyForDupes = map(
            filter(value, (row) => dupes.includes("" + row[field.dataIndex as keyof T])),
            "key",
          );
          if (dupes.length) {
            broken = true;
            details.push({ name: field.title as string, vals: uniq(dupes), keys: keyForDupes });
          }
        });
        setDuplInfo(details);
        return broken ? Promise.reject(new Error()) : Promise.resolve();
      },
      message: "Prüfe alle Felder auf Duplikate",
    } as ValidatorRule;
  }, [uniqueFields]);

  return (
    <Form.Item
      name={name}
      rules={[requiredFields && requiredValidator, uniqueFields && uniqueValidator]}
      trigger="onTable"
      valuePropName="value"
    >
      <EditableTableInner<T>
        columnDescriptions={columnDescriptions}
        duplInfo={duplInfo}
        fixedMinHeight={fixedMinHeight}
        newRowFactory={newRowFactory}
        requiredErrors={requiredErrors}
        usersWithKann={usersWithKann}
      />
    </Form.Item>
  );
}
