import { Col, Row } from "antd";
import React from "react";
import TechnikCard from "@/components/veranstaltung/technik/TechnikCard";
import { TabProps } from "@/components/veranstaltung/VeranstaltungTabs";

export default function TabTechnik({ optionen, veranstaltung, form }: TabProps) {
  return (
    <Row gutter={12}>
      <Col span={24}>
        <TechnikCard form={form} optionen={optionen} veranstaltung={veranstaltung} />
      </Col>
    </Row>
  );
}
