import { Col } from "antd";
import React from "react";
import PresseCard from "@/components/veranstaltung/presse/PresseCard.tsx";
import { JazzRow } from "@/widgets/JazzRow";

export default function TabPresse() {
  return (
    <JazzRow>
      <Col span={24}>
        <PresseCard isVermietung />
      </Col>
    </JazzRow>
  );
}
