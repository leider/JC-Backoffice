import React, { useEffect, useMemo, useState } from "react";
import Konzert from "jc-shared/konzert/konzert.ts";
import { Col, Collapse, ConfigProvider } from "antd";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import TeamBlockHeader from "@/components/team/TeamBlock/TeamBlockHeader.tsx";
import TeamContent from "@/components/team/TeamBlock/TeamContent.tsx";
import { ButtonPreview } from "@/components/team/TeamBlock/ButtonPreview.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

interface TeamBlockAdminProps {
  veranstaltung: Konzert;
  initiallyOpen: boolean;
}

export default function TeamBlockNormal({ veranstaltung, initiallyOpen }: TeamBlockAdminProps) {
  const { memoizedId } = useJazzContext();
  const highlight = useMemo(() => veranstaltung.id === memoizedId, [memoizedId, veranstaltung.id]);
  const [expanded, setExpanded] = useState<boolean>(initiallyOpen || highlight);
  useEffect(() => {
    setExpanded(initiallyOpen || highlight);
  }, [highlight, initiallyOpen]);

  const textColor = useMemo(() => (veranstaltung.isVermietung ? undefined : "#fff"), [veranstaltung.isVermietung]);

  return (
    <ConfigProvider theme={{ token: { fontSizeIcon: expanded ? 18 : 14 } }}>
      <Col span={24} id={veranstaltung.id} style={highlight ? { border: "solid 4px" } : undefined}>
        {veranstaltung.ghost ? (
          <div style={{ backgroundColor: veranstaltung.color, padding: "2px 16px" }}>
            <TeamBlockHeader veranstaltung={veranstaltung} expanded={initiallyOpen} />
          </div>
        ) : (
          <Collapse
            style={{ borderColor: veranstaltung.color }}
            size={"small"}
            activeKey={expanded ? veranstaltung.id : ""}
            onChange={() => {
              setExpanded(!expanded);
            }}
            expandIcon={({ isActive }) => (isActive ? <CaretDown color={textColor} /> : <CaretRight color={textColor} />)}
            items={[
              {
                key: veranstaltung.id || "",
                style: { backgroundColor: veranstaltung.color },
                label: <TeamBlockHeader veranstaltung={veranstaltung} expanded={expanded} />,
                extra: <ButtonPreview veranstaltung={veranstaltung} />,
                children: <TeamContent veranstaltung={veranstaltung} />,
              },
            ]}
          />
        )}
      </Col>
    </ConfigProvider>
  );
}
