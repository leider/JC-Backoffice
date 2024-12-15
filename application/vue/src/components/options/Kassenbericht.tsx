import * as React from "react";
import { Col, Form, Row } from "antd";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import TableFormItem from "@/widgets/EditableTable/TableFormItem.tsx";
import { useEffect, useState } from "react";

export default function Kassenbericht() {
  useDirtyBlocker(false);

  document.title = "Kassenbericht";

  const [form] = Form.useForm();

  const rows = Form.useWatch("datarows", { form });

  useEffect(() => {
    form.setFieldsValue({
      datarows: [
        {
          key: "0",
          name: "Edward King 0",
          age: "32",
          address: "London, Park Lane no. 0",
        },
        {
          key: "1",
          name: "Edward King 1",
          age: "32",
          address: "London, Park Lane no. 1",
        },
      ],
    });
  }, [form]);

  useEffect(() => {
    console.log(rows);
  }, [rows]);

  return (
    <Form form={form} layout="vertical">
      <JazzPageHeader title="Kassenberichte" />
      <RowWrapper>
        <Row gutter={12}>
          <Col span={24}>
            <TableFormItem name={"datarows"} label={"Der Label"} />
          </Col>
        </Row>
      </RowWrapper>
    </Form>
  );
}
