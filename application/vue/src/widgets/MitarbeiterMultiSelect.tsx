import { Form, Select, Tag } from "antd";
import React, { useEffect, useRef } from "react";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";
import { KannSection } from "jc-shared/user/user.ts";
import { BaseOptionType, RefSelectProps } from "antd/es/select";
import { useTagRenderForUser } from "@/widgets/useTagRenderForUser.tsx";
import map from "lodash/map";
import filter from "lodash/filter";

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
      case "Ersthelfer":
        return "darkgreen";
    }
  }

  return (
    <span key={user.value}>
      {user.label}{" "}
      {map(user.kann, (kann) => {
        return (
          <Tag key={kann} color={colorFor(kann)}>
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
  value,
  save,
  focus,
}: {
  usersAsOptions: UserWithKann[];
  disabled?: boolean;
  onChange?: (value: string[]) => void;
  value?: string[];
  save?: (keepEditing?: boolean) => void;
  focus?: boolean;
}) {
  const ref = useRef<RefSelectProps>(null);
  useEffect(() => {
    if (focus && usersAsOptions) {
      ref.current?.focus();
    }
  }, [focus, usersAsOptions]);

  const renderInList = (row: { data: BaseOptionType }) => <FullUserWithKanns user={row.data as UserWithKann} />;

  const tagRender = useTagRenderForUser(usersAsOptions);
  const filterOption = (searchString: string, row?: UserWithKann) =>
    row?.value.toLowerCase().includes(searchString.toLowerCase()) ||
    row?.label.toLowerCase().includes(searchString.toLowerCase()) ||
    map(row?.kann, (k) => (k === "Master" ? "Abendverantwortlicher" : k))
      .join(",")
      .toLowerCase()
      .includes(searchString.toLowerCase()) ||
    false;

  const filtered = filter(usersAsOptions, (u) => !value?.includes(u.value));

  return (
    <Select
      ref={ref}
      mode="multiple"
      options={filtered}
      tagRender={tagRender}
      optionRender={renderInList}
      disabled={disabled}
      style={{ width: "100%" }}
      showSearch
      filterOption={filterOption}
      placeholder={disabled ? "" : "Tippen zum Suchen nach irgendwas"}
      onChange={(val) => {
        onChange?.(val);
        save?.(true);
      }}
      value={value}
      onBlur={() => save?.()}
    />
  );
}

export default function MitarbeiterMultiSelect({
  name,
  usersAsOptions,
  disabled,
  label,
  save,
  focus,
}: {
  name: string | string[];
  usersAsOptions: UserWithKann[];
  disabled?: boolean;
  label?: string;
  save?: (keepEditing?: boolean) => void;
  focus?: boolean;
}) {
  return (
    <Form.Item label={label ? <b>{label}:</b> : undefined} name={name} noStyle={!label}>
      <InnerSelect usersAsOptions={usersAsOptions} disabled={disabled} save={save} focus={focus} />
    </Form.Item>
  );
}
