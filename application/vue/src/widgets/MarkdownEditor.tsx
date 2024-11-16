import { Form } from "antd";
import React, { ReactNode } from "react";
import { Editable, useEditor } from "@wysimark/react";

export function MarkdownEditor({ label, name }: { label?: string | ReactNode; name: string[] | string }) {
  return (
    <Form.Item label={label} name={name}>
      <InnerEditor />
    </Form.Item>
  );
}

function InnerEditor({ value, onChange }: { value?: string; onChange?: (value: string) => void }) {
  const editor = useEditor({ authToken: "" });
  return <Editable editor={editor} value={value ?? ""} onChange={onChange!} />;
}
