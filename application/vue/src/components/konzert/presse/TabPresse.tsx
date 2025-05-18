import { Col } from "antd";
import React from "react";
import PresseCard from "@/components/veranstaltung/presse/PresseCard.tsx";
import { JazzRow } from "@/widgets/JazzRow";
import ScrollingContent from "@/components/content/ScrollingContent.tsx";

export default function TabPresse() {
  return (
    <JazzRow>
      <Col span={24}>
        <ScrollingContent>
          <PresseCard isVermietung={false} />
        </ScrollingContent>
      </Col>
    </JazzRow>
  );
}
