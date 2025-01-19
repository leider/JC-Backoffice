import { Col } from "antd";
import React from "react";
import TechnikCard from "@/components/konzert/technik/TechnikCard";
import RiderCard from "@/components/konzert/technik/RiderCard.tsx";
import { JazzRow } from "@/widgets/JazzRow";

export default function TabTechnik() {
  return (
    <JazzRow>
      <Col span={24}>
        <TechnikCard />
        <RiderCard />
      </Col>
    </JazzRow>
  );
}
