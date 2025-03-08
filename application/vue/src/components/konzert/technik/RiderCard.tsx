import React, { useMemo } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Form } from "antd";
import { RiderComp } from "@/components/rider/RiderComp.tsx";
import { useLocation } from "react-router";
import ButtonForRider from "@/components/konzert/technik/ButtonForRider.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function RiderCard() {
  const { search } = useLocation();
  const href = useMemo(() => {
    return window.location.href.replace("vue/konzert", "rider").replace(search, "");
  }, [search]);

  const text = useMemo(() => {
    return encodeURIComponent(`Hallo,
unter folgendem Link kannst Du einen Rider erstellen oder bearbeiten:
    
${href}

Hier kannst Du einfach alles, was du brauchst, mit der Maus aus dem Kasten links auf die Bühne ziehen, drehen, positionieren und bei eigenen Sachen beschriften.
Wenn Du was doch nicht brauchst, wieder von der Bühne in den Kasten ziehen.
Die gezeichnete Bühne entspricht unserer Bühnengröße und die Elemente Flügel, Drumset auch ungefähr der realen Größe.

Liebe Grüße,
Dein Jazzclub Team
    `);
  }, [href]);

  const printref = useMemo(() => {
    return href.replace("rider", "pdf/rider");
  }, [href]);

  return (
    <Collapsible label="Rider" suffix="technik">
      <JazzRow>
        <Col span={24}>
          <JazzPageHeader
            buttons={[
              <ButtonForRider href={printref} icon="Printer" key="pdf" text="PDF" />,
              <ButtonForRider
                href={`mailto:?subject=Rider für Jazzclub bearbeiten&body=${text}`}
                icon="EnvelopeFill"
                key="sendrider"
                text="Als E-Mail..."
              />,
              <ButtonForRider href={href} icon="EyeFill" key="linkrider" text="Vorschau" />,
            ]}
            title=""
          />
          <Form.Item name="riderBoxes" trigger="setTargetBoxes" valuePropName="targetBoxes">
            <RiderComp />
          </Form.Item>
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
