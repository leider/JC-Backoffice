import React, { useMemo } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Form, Row } from "antd";
import { RiderComp } from "@/components/rider/RiderComp.tsx";
import { PageHeader } from "@ant-design/pro-layout";
import ButtonWithIcon from "@/widgets/ButtonWithIcon.tsx";
import { useLocation } from "react-router-dom";

export default function RiderCard() {
  const { search } = useLocation();
  const href = useMemo(() => {
    return window.location.href.replace("vue/veranstaltung", "rider").replace(search, "");
  }, [search]);

  const text = useMemo(() => {
    return encodeURIComponent(`Hallo,
unter folgendem Link kannst Du einen Rider erstellen oder bearbeiten:
    
${href}

Liebe Grüße,
Dein Jazzclub Team
    `);
  }, [href]);

  const printref = useMemo(() => {
    return href.replace("rider", "pdf/rider");
  }, [href]);

  return (
    <CollapsibleForVeranstaltung suffix="technik" label="Rider">
      <Row gutter={12}>
        <Col span={24}>
          <PageHeader
            extra={[
              <ButtonWithIcon key={"pdf"} icon={"Printer"} text="PDF" href={printref} target="_blank" />,
              <ButtonWithIcon
                key={"sendrider"}
                icon={"EnvelopeFill"}
                text="Als E-Mail..."
                href={"mailto:?subject=" + "Rider für Jazzclub bearbeiten" + "&body=" + text}
              />,
              <ButtonWithIcon key={"linkrider"} icon={"EyeFill"} text="Vorschau" href={href} target="_blank" />,
            ]}
          />
          <Form.Item name="riderBoxes" valuePropName="targetBoxes" trigger="setTargetBoxes">
            <RiderComp />
          </Form.Item>
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
