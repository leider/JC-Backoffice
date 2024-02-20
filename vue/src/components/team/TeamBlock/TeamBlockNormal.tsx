import React, { useEffect, useMemo, useState } from "react";
import Konzert from "../../../../../shared/konzert/konzert.ts";
import { Col, Collapse, ConfigProvider } from "antd";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import TeamBlockHeader from "@/components/team/TeamBlock/TeamBlockHeader.tsx";
import TeamContent from "@/components/team/TeamBlock/TeamContent.tsx";
import { ButtonPreview } from "@/components/team/TeamBlock/ButtonPreview.tsx";

interface TeamBlockAdminProps {
  veranstaltung: Konzert;
  initiallyOpen: boolean;
}

export default function TeamBlockNormal({ veranstaltung, initiallyOpen }: TeamBlockAdminProps) {
  const [color, setColor] = useState<string | undefined>("");

  const isVermietung = useMemo(() => veranstaltung.isVermietung, [veranstaltung.isVermietung]);

  useEffect(() => {
    setColor(isVermietung ? "#f6eee1" : veranstaltung.kopf.eventTypRich?.color || "#6c757d");
  }, [isVermietung, veranstaltung]);

  const [expanded, setExpanded] = useState<boolean>();
  useEffect(() => {
    setExpanded(initiallyOpen);
  }, [initiallyOpen]);
  return (
    <ConfigProvider theme={{ token: { fontSizeIcon: expanded ? 18 : 14 } }}>
      <Col span={24}>
        <Collapse
          style={{ borderColor: color }}
          size={"small"}
          activeKey={expanded ? veranstaltung.id : ""}
          onChange={() => {
            setExpanded(!expanded);
          }}
          expandIcon={({ isActive }) =>
            isActive ? <CaretDown color={isVermietung ? undefined : "#fff"} /> : <CaretRight color={isVermietung ? undefined : "#fff"} />
          }
          items={[
            {
              key: veranstaltung.id || "",
              style: { backgroundColor: color },
              label: <TeamBlockHeader veranstaltung={veranstaltung} expanded={expanded} />,
              extra: <ButtonPreview veranstaltung={veranstaltung} />,
              children: <TeamContent veranstaltung={veranstaltung} />,
            },
          ]}
        />
      </Col>
    </ConfigProvider>
  );
}
