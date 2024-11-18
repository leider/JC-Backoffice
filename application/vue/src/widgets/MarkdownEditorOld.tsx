import { Form, Typography } from "antd";
import SimpleMdeReact from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import React, { ReactNode } from "react";

export function MarkdownEditorOld({
  label,
  name,
  options = { status: false, spellChecker: false },
  onBlur,
}: {
  label?: string | ReactNode;
  name: string[] | string;
  options?: EasyMDE.Options;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
}) {
  return (
    <Form.Item label={label} name={name}>
      <InnerEditor options={options} onBlur={onBlur} />
    </Form.Item>
  );
}

function InnerEditor({
  options = { status: false, spellChecker: false },
  onBlur,
  value,
  onChange,
}: {
  value?: string;
  onChange?: (value: string) => void;
  options?: EasyMDE.Options;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
}) {
  return (
    <>
      <SimpleMdeReact autoFocus options={options} onBlur={onBlur} value={value} onChange={onChange} />
      <Typography.Text strong type="success">
        Denk daran, den Text zu formatieren und die Vorschau zu checken! (Auge, Fragezeichen für Hilfe)
      </Typography.Text>
    </>
  );
}
