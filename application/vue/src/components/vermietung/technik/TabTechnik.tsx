import { Col } from "antd";
import React from "react";
import TechnikCard from "@/components/veranstaltung/technik/TechnikCard.tsx";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import ScrollingContent from "@/components/content/ScrollingContent.tsx";

export default function TabTechnik() {
  return (
    <ScrollingContent>
      <JazzRow>
        <Col span={24}>
          <TechnikCard fuerVermietung />
        </Col>
      </JazzRow>
    </ScrollingContent>
  );
}
