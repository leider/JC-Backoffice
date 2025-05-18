import { Col } from "antd";
import React from "react";
import PresseCard from "@/components/veranstaltung/presse/PresseCard.tsx";
import { JazzRow } from "@/widgets/JazzRow";
import ScrollingContent from "@/components/content/ScrollingContent";

export default function TabPresse() {
  return (
    <ScrollingContent>
      <JazzRow>
        <Col span={24}>
          <PresseCard isVermietung />
        </Col>
      </JazzRow>
    </ScrollingContent>
  );
}
