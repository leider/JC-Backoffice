import { Form, Select, Tag } from "antd";
import React from "react";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";
import { KannSection } from "jc-shared/user/user.ts";
import { BaseOptionType } from "antd/es/select";

export type UserWithKann = LabelAndValue & { kann: KannSection[] };

function FullUserWithKanns({ user }: { user: UserWithKann }) {
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
    <span key={user.value}>
      {user.label}{" "}
      {user.kann.map((kann) => {
        return (
          <Tag key={kann} color={colorFor(kann)}>
            {kann}
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
  value,
}: {
  usersAsOptions: UserWithKann[];
  disabled?: boolean;
  onChange?: (value: string[]) => void;
  value?: string[];
}) {
  const renderInList = (row: { data: BaseOptionType }) => <FullUserWithKanns user={row.data as UserWithKann} />;

  const filterOption = (searchString: string, row?: UserWithKann) =>
    row?.value.toLowerCase().includes(searchString.toLowerCase()) ||
    row?.label.toLowerCase().includes(searchString.toLowerCase()) ||
    row?.kann.join(",").toLowerCase().includes(searchString.toLowerCase()) ||
    false;

  const filtered = usersAsOptions.filter((u) => !value?.includes(u.value));

  return (
    <Select
      mode="multiple"
      options={filtered}
      optionRender={renderInList}
      disabled={disabled}
      style={{ width: "100%" }}
      showSearch
      filterOption={filterOption}
      placeholder="Tippen zum Suchen nach irgendwas"
      onChange={onChange}
    />
  );
}

export default function MitarbeiterMultiSelect({
  name,
  usersAsOptions,
  disabled,
  label,
}: {
  name: string | string[];
  usersAsOptions: UserWithKann[];
  disabled?: boolean;
  label?: string;
}) {
  return (
    <Form.Item label={label ? <b>{label}:</b> : undefined} name={name} noStyle={!label}>
      <InnerSelect usersAsOptions={usersAsOptions} disabled={disabled} />
    </Form.Item>
  );
}
