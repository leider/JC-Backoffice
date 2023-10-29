import { Col, Row } from "antd";
import React from "react";
import { VermietungTabProps } from "@/components/vermietung/VermietungTabs.tsx";
import TechnikCard from "@/components/vermietung/technik/TechnikCard.tsx";

export default function TabTechnik({ optionen, form }: VermietungTabProps) {
  return (
    <Row gutter={12}>
      <Col span={24}>
        <TechnikCard form={form} optionen={optionen!} />
      </Col>
    </Row>
  );
}
