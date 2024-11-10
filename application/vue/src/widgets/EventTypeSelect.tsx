import { Form, Select, SelectProps } from "antd";
import { TypMitMehr } from "jc-shared/optionen/optionValues.ts";
import React, { useMemo } from "react";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

export function EventTypeSelect(props: SelectProps) {
  const { optionen } = useJazzContext();

  const eventTypes = useMemo(() => {
    function typToDisplay(typ: TypMitMehr) {
      return {
        label: <span style={{ color: typ.color }}>{typ.name}</span>,
        value: typ.name,
      };
    }
    return optionen.typenPlus.map(typToDisplay);
  }, [optionen.typenPlus]);

  return (
    <Form.Item label={<b>Typ:</b>} name={["kopf", "eventTyp"]} required rules={[{ required: true }]}>
      <Select options={eventTypes} {...props} showSearch />
    </Form.Item>
  );
}
