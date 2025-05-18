import { Col } from "antd";
import React from "react";
import RiderCard from "@/components/konzert/technik/RiderCard.tsx";
import { JazzRow } from "@/widgets/JazzRow";
import TechnikCard from "@/components/veranstaltung/technik/TechnikCard.tsx";
import ScrollingContent from "@/components/content/ScrollingContent.tsx";

export default function TabTechnik() {
  return (
    <ScrollingContent>
      <JazzRow>
        <Col span={24}>
          <TechnikCard fuerVermietung={false} />
          <RiderCard />
        </Col>
      </JazzRow>
    </ScrollingContent>
  );
}
