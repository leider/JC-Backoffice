import { Col } from "antd";
import React from "react";
import TechnikCard from "@/components/vermietung/technik/TechnikCard.tsx";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function TabTechnik() {
  return (
    <JazzRow>
      <Col span={24}>
        <TechnikCard />
      </Col>
    </JazzRow>
  );
}
