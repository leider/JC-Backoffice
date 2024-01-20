import { Form, Select, Tag, Tooltip } from "antd";
import React, { CSSProperties } from "react";
import { CustomTagProps } from "rc-select/lib/BaseSelect";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";
import { KannSection } from "jc-shared/user/user.ts";
import { StaffType } from "jc-shared/veranstaltung/staff.ts";
import { BaseOptionType } from "antd/es/select";

export type UserWithKann = LabelAndValue & { kann: KannSection[] };
export default function MitarbeiterMultiSelect({
  sectionName,
  usersAsOptions,
  disabled,
  style,
  label,
  onChange,
}: {
  sectionName: StaffType;
  usersAsOptions: UserWithKann[];
  disabled?: boolean;
  style?: CSSProperties;
  label?: string;
  onChange?: (value: string[]) => void;
}) {
  const tagRender = ({ label, value, closable, onClose }: CustomTagProps) => {
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag onMouseDown={onPreventMouseDown} closable={closable} onClose={onClose} style={{ marginRight: 3, paddingInline: 3 }}>
        <Tooltip title={label}>{value}</Tooltip>
      </Tag>
    );
  };

  function renderInList(row: { data: BaseOptionType }) {
    const user = row.data as UserWithKann;

    function colorFor(kann: KannSection) {
      switch (kann) {
        case "Kasse":
          return "red";
        case "Ton":
          return "green";
        case "Licht":
          return "blue";
        case "Master":
          return "orange";
      }
    }

    return (
      <span>
        {user.label}{" "}
        {user.kann.map((kann) => {
          return (
            <Tag key={user.value} color={colorFor(kann)}>
              {kann}
            </Tag>
          );
        })}
      </span>
    );
  }

  function filterOption(searchString: string, row?: UserWithKann) {
    return (
      row?.value.toLowerCase().includes(searchString.toLowerCase()) ||
      row?.label.toLowerCase().includes(searchString.toLowerCase()) ||
      row?.kann.join(",").toLowerCase().includes(searchString.toLowerCase()) ||
      false
    );
  }

  return (
    <Form.Item label={label ? <b>{label}:</b> : undefined} name={["staff", sectionName]} noStyle={!label}>
      <Select
        mode="multiple"
        options={usersAsOptions}
        optionRender={renderInList}
        disabled={disabled}
        tagRender={tagRender}
        style={{ ...style, width: "100%" }}
        onChange={onChange}
        showSearch
        filterOption={filterOption}
        placeholder="Tippen zum Suchen nach irgendwas"
      />
    </Form.Item>
  );
}
