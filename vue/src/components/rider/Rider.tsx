import type { FC } from "react";
import React, { useCallback, useState } from "react";
import { Container } from "@/components/rider/Container.tsx";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Checkbox, Col, Row } from "antd";

export const Rider: FC = () => {
  const [hideSourceOnDrag, setHideSourceOnDrag] = useState(true);
  const toggle = useCallback(() => setHideSourceOnDrag(!hideSourceOnDrag), [hideSourceOnDrag]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Row gutter={16}>
        <Col span={24}>
          <Container hideSourceOnDrag={hideSourceOnDrag} />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Checkbox onChange={toggle} checked={hideSourceOnDrag}>
            <b>Nicht zeigen</b>
          </Checkbox>
        </Col>
      </Row>
    </DndProvider>
  );
};
