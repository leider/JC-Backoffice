import React, { useEffect, useMemo, useState } from "react";
import { Col, Collapse, ConfigProvider } from "antd";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import TeamBlockHeader from "@/components/team/TeamBlock/TeamBlockHeader.tsx";
import TeamContent from "@/components/team/TeamBlock/TeamContent.tsx";
import { ButtonPreview } from "@/components/team/TeamBlock/ButtonPreview.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { useInView } from "react-intersection-observer";

export default function TeamBlockNormal({ veranstaltung, initiallyOpen }: { veranstaltung: Veranstaltung; initiallyOpen: boolean }) {
  const { memoizedId, isDarkMode } = useJazzContext();
  const highlight = useMemo(() => veranstaltung.id === memoizedId, [memoizedId, veranstaltung.id]);
  const [expanded, setExpanded] = useState<boolean>(initiallyOpen || highlight);
  useEffect(() => {
    setExpanded(initiallyOpen || highlight);
  }, [highlight, initiallyOpen]);

  const textColor = useMemo(() => veranstaltung.colorText(isDarkMode), [isDarkMode, veranstaltung]);
  const backgroundColor = useMemo(() => veranstaltung.color, [veranstaltung.color]);

  const theme = useMemo(() => {
    return {
      token: { fontSizeIcon: expanded ? 18 : 14, colorText: textColor, colorBgBase: backgroundColor },
      components: { Collapse: { contentBg: backgroundColor, headerBg: backgroundColor } },
    };
  }, [backgroundColor, expanded, textColor]);

  const { inView, ref } = useInView({ triggerOnce: true });

  return (
    <ConfigProvider theme={theme}>
      <Col id={veranstaltung.id} ref={ref} span={24} style={highlight ? { border: "solid 4px" } : undefined}>
        {veranstaltung.ghost ? (
          <div style={{ padding: "2px 16px", backgroundColor }}>
            <TeamBlockHeader veranstaltung={veranstaltung} />
          </div>
        ) : inView || expanded ? (
          <Collapse
            activeKey={expanded ? veranstaltung.id : ""}
            expandIcon={({ isActive }) => (isActive ? <CaretDown color={textColor} /> : <CaretRight color={textColor} />)}
            items={[
              {
                key: veranstaltung.id || "",
                style: { backgroundColor: backgroundColor },
                label: <TeamBlockHeader expanded={expanded} veranstaltung={veranstaltung} />,
                extra: <ButtonPreview veranstaltung={veranstaltung} />,
                children: <TeamContent veranstaltung={veranstaltung} />,
              },
            ]}
            onChange={() => setExpanded(!expanded)}
            size="small"
            style={{ borderColor: backgroundColor }}
          />
        ) : (
          <div style={{ backgroundColor: backgroundColor }}>
            <TeamBlockHeader veranstaltung={veranstaltung} />
          </div>
        )}
      </Col>
    </ConfigProvider>
  );
}
