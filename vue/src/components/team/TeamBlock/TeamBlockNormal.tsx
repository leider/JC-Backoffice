import React, { useEffect, useState } from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { Col, Collapse, ConfigProvider, theme } from "antd";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import cssColor from "jc-shared/commons/fieldHelpers.ts";
import TeamBlockHeader from "@/components/team/TeamBlock/TeamBlockHeader.tsx";
import TeamContent from "@/components/team/TeamBlock/TeamContent.tsx";
import { ButtonPreview } from "@/components/Buttons.tsx";

interface TeamBlockAdminProps {
  veranstaltung: Veranstaltung;
  initiallyOpen: boolean;
}

export default function TeamBlockNormal({ veranstaltung, initiallyOpen }: TeamBlockAdminProps) {
  const { useToken } = theme;
  const { token } = useToken();
  const [color, setColor] = useState<string>("");
  useEffect(
    () => {
      const code = `custom-color-${cssColor(veranstaltung.kopf.eventTyp)}`;
      setColor((token as any)[code]);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [veranstaltung],
  );

  const [expanded, setExpanded] = useState<boolean>();
  useEffect(() => {
    setExpanded(initiallyOpen);
  }, [initiallyOpen]);
  return (
    <ConfigProvider theme={{ token: { fontSizeIcon: expanded ? 18 : 14 } }}>
      <Col xs={24} sm={12} lg={8} xl={6} xxl={4}>
        <Collapse
          style={{ borderColor: color }}
          size={"small"}
          activeKey={expanded ? veranstaltung.id : ""}
          onChange={() => {
            setExpanded(!expanded);
          }}
          expandIcon={({ isActive }) => (isActive ? <CaretDown color="#fff" /> : <CaretRight color="#fff  " />)}
          items={[
            {
              key: veranstaltung.id || "",
              style: { backgroundColor: color },
              label: <TeamBlockHeader veranstaltungOderVermietung={veranstaltung} expanded={expanded} />,
              extra: <ButtonPreview veranstaltung={veranstaltung} />,
              children: <TeamContent veranstaltung={veranstaltung} />,
            },
          ]}
        />
      </Col>
    </ConfigProvider>
  );
}