import { Form } from "antd";
import SimpleMdeReact from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import React, { ReactNode } from "react";

export function MarkdownEditor({
  label,
  name,
  options = { status: false, spellChecker: false },
  onBlur,
}: {
  label?: string | ReactNode;
  name: string[] | string;
  options: EasyMDE.Options;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
}) {
  return (
    <Form.Item label={label} name={name}>
      <SimpleMdeReact autoFocus options={options} onBlur={onBlur} />
    </Form.Item>
  );
}
