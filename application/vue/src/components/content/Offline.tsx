import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { Button, Col, Row } from "antd";
import React, { useCallback } from "react";
import { useNavigate } from "react-router";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";

export default function Offline() {
  const navigate = useNavigate();
  const backHome = useCallback(() => {
    navigate("/");
  }, [navigate]);
  return (
    <>
      <JazzPageHeader title="Backend nicht erreichbar" />
      <RowWrapper>
        <Row align="middle" style={{ minHeight: "80vh" }}>
          <Col offset={8} span={8}>
            <p>Kann sich nur um wenige Augenblicke handeln...</p>
            <Button onClick={backHome} type="primary">
              Zurück
            </Button>
          </Col>
        </Row>
      </RowWrapper>
    </>
  );
}
