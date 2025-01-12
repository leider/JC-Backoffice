import { Form, Select, SelectProps } from "antd";
import React from "react";
import { useEventTypes } from "@/widgets/EventTypeSelects/useEventTypes.tsx";

export function EventTypeSelect(props: SelectProps) {
  const eventTypes = useEventTypes();
  return (
    <Form.Item label={<b>Typ:</b>} name={["kopf", "eventTyp"]} required rules={[{ required: true }]}>
      <Select options={eventTypes} {...props} showSearch />
    </Form.Item>
  );
}
