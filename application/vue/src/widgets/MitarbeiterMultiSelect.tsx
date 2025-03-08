import { Form, Select, Tag } from "antd";
import React, { useEffect, useRef } from "react";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";
import { KannSection } from "jc-shared/user/user.ts";
import { BaseOptionType, RefSelectProps } from "antd/es/select";
import { useTagRenderForUser } from "@/widgets/useTagRenderForUser.tsx";
import map from "lodash/map";
import filter from "lodash/filter";

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
  value,
  save,
  focus,
}: {
  readonly usersAsOptions: UserWithKann[];
  readonly disabled?: boolean;
  readonly onChange?: (value: string[]) => void;
  readonly value?: string[];
  readonly save?: (keepEditing?: boolean) => void;
  readonly focus?: boolean;
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
      disabled={disabled}
      filterOption={filterOption}
      mode="multiple"
      onBlur={() => save?.()}
      onChange={(val) => {
        onChange?.(val);
        save?.(true);
      }}
      optionRender={renderInList}
      options={filtered}
      placeholder={disabled ? "" : "Tippen zum Suchen nach irgendwas"}
      ref={ref}
      showSearch
      style={{ width: "100%" }}
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
  save,
  focus,
}: {
  readonly name: string | string[];
  readonly usersAsOptions: UserWithKann[];
  readonly disabled?: boolean;
  readonly label?: string;
  readonly save?: (keepEditing?: boolean) => void;
  readonly focus?: boolean;
}) {
  return (
    <Form.Item label={label ? <b>{label + ":"}</b> : undefined} name={name} noStyle={!label}>
      <InnerSelect disabled={disabled} focus={focus} save={save} usersAsOptions={usersAsOptions} />
    </Form.Item>
  );
}
