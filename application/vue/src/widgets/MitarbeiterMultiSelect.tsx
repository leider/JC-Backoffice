import { Form, Select, Tag } from "antd";
import React, { useCallback } from "react";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";
import { KannSection } from "jc-shared/user/user.ts";
import { BaseOptionType } from "antd/es/select";
import { useTagRenderForUser } from "@/widgets/useTagRenderForUser.tsx";
import map from "lodash/map";
import { useFormItemInTableStyle } from "@/widgets/EditableTable/useFormItemInTableStyle.ts";

export type UserWithKann = LabelAndValue & { kann: KannSection[] };

function FullUserWithKanns({ user }: { readonly user: UserWithKann }) {
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
      case "Ersthelfer":
        return "darkgreen";
    }
  }

  return (
    <span key={user.value}>
      {user.label}{" "}
      {map(user.kann, (kann) => {
        return (
          <Tag color={colorFor(kann)} key={kann}>
            {kann === "Master" ? "Abendverantwortlicher" : kann}
          </Tag>
        );
      })}
    </span>
  );
}

function InnerSelect({
  usersAsOptions,
  disabled,
  onChange,
  useInTable,
  value,
}: {
  readonly usersAsOptions: UserWithKann[];
  readonly disabled?: boolean;
  readonly onChange?: (value: string[]) => void;
  readonly useInTable?: boolean;

  readonly value?: string[];
}) {
  const style = useFormItemInTableStyle(useInTable);
  const renderInList = useCallback((row: { data: BaseOptionType }) => <FullUserWithKanns user={row.data as UserWithKann} />, []);

  const tagRender = useTagRenderForUser(usersAsOptions);
  const filterOption = useCallback(
    (searchString: string, row?: UserWithKann) =>
      row?.value.toLowerCase().includes(searchString.toLowerCase()) ||
      row?.label.toLowerCase().includes(searchString.toLowerCase()) ||
      map(row?.kann, (k) => (k === "Master" ? "Abendverantwortlicher" : k))
        .join(",")
        .toLowerCase()
        .includes(searchString.toLowerCase()) ||
      false,
    [],
  );

  return (
    <Select
      disabled={disabled}
      mode="multiple"
      onChange={onChange}
      optionRender={renderInList}
      options={usersAsOptions}
      placeholder={disabled ? "" : "Tippen zum Suchen nach irgendwas"}
      showSearch={{ filterOption }}
      style={{ ...style, width: "100%" }}
      tagRender={tagRender}
      value={value}
    />
  );
}

export default function MitarbeiterMultiSelect({
  name,
  usersAsOptions,
  disabled,
  label,
  useInTable,
}: {
  readonly name: string | string[];
  readonly usersAsOptions: UserWithKann[];
  readonly disabled?: boolean;
  readonly label?: string;
  readonly useInTable?: boolean;
}) {
  return (
    <Form.Item label={label ? <b>{label + ":"}</b> : undefined} name={name} noStyle={!label}>
      <InnerSelect disabled={disabled} useInTable={useInTable} usersAsOptions={usersAsOptions} />
    </Form.Item>
  );
}
