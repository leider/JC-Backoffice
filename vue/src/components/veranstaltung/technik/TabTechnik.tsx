import { Col, Row } from "antd";
import React from "react";
import TechnikCard from "@/components/veranstaltung/technik/TechnikCard";
import { VeranstaltungTabProps } from "@/components/veranstaltung/VeranstaltungTabs";

export default function TabTechnik({ optionen, form }: VeranstaltungTabProps) {
  return (
    <Row gutter={12}>
      <Col span={24}>
        <TechnikCard form={form} optionen={optionen!} />
      </Col>
    </Row>
  );
}
