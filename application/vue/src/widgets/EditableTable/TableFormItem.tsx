import { Form } from "antd";
import TablePlay from "@/widgets/EditableTable/TablePlay.tsx";

export default function TableFormItem({ name, label }: { name: string[] | string; label: string }) {
  return (
    <Form.Item name={name} label={label} valuePropName="value" trigger="onChange">
      <TablePlay />
    </Form.Item>
  );
}
