import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Col, Collapse, ConfigProvider } from "antd";
import TeamBlockHeader from "@/components/team/TeamBlock/TeamBlockHeader.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { expandIcon } from "@/widgets/collapseExpandIcon.tsx";
import { useInView } from "react-intersection-observer";
import { ButtonPreview } from "@/components/team/TeamBlock/ButtonPreview.tsx";
import { TeamContext } from "@/components/team/TeamContext.ts";

export default function TeamBlockCommons({
  veranstaltung,
  initiallyOpen,
  contentComponent,
  extrasExpanded,
}: {
  readonly veranstaltung: Veranstaltung;
  readonly initiallyOpen: boolean;
  readonly contentComponent: ReactNode;
  readonly extrasExpanded?: ReactNode;
}) {
  const { memoizedVeranstaltung, isDarkMode } = useJazzContext();
  const { period } = useContext(TeamContext);
  const highlight = useMemo(() => veranstaltung.id === memoizedVeranstaltung?.id, [memoizedVeranstaltung, veranstaltung.id]);
  const [expanded, setExpanded] = useState<boolean>(initiallyOpen || highlight);
  useEffect(() => {
    setExpanded(initiallyOpen || highlight);
    if (highlight) {
      setTimeout(() => {
        const element = document.getElementById(memoizedVeranstaltung?.id ?? "");
        if (element) {
          element?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 1000);
    }
  }, [highlight, initiallyOpen, memoizedVeranstaltung]);

  const textColor = useMemo(() => veranstaltung.colorText(isDarkMode), [isDarkMode, veranstaltung]);
  const backgroundColor = useMemo(() => veranstaltung.color, [veranstaltung.color]);
  const onChange = useCallback(() => setExpanded(!expanded), [expanded]);

  const theme = useMemo(() => {
    return {
      token: { fontSizeIcon: expanded ? 18 : 14, colorText: textColor, colorBgBase: backgroundColor },
      components: { Collapse: { contentBg: backgroundColor, headerBg: backgroundColor } },
    };
  }, [backgroundColor, expanded, textColor]);

  const extrasComponent = <ButtonPreview veranstaltung={veranstaltung} />;

  const { inView, ref } = useInView({ triggerOnce: true });
  const renderWhenInView = useMemo(() => {
    return (
      inView ||
      veranstaltung.isDisplayedAbove(memoizedVeranstaltung, period === "Vergangene") ||
      veranstaltung.id === memoizedVeranstaltung?.id
    );
  }, [inView, memoizedVeranstaltung, period, veranstaltung]);

  return (
    <ConfigProvider theme={theme}>
      <Col id={veranstaltung.id} ref={ref} span={24} style={highlight ? { border: "solid 4px" } : undefined}>
        {veranstaltung.ghost ? (
          <div style={{ backgroundColor, padding: "2px 16px" }}>
            <TeamBlockHeader veranstaltung={veranstaltung} />
          </div>
        ) : (
          <Collapse
            activeKey={expanded ? veranstaltung.id : undefined}
            expandIcon={expandIcon({ color: textColor })}
            items={[
              {
                key: veranstaltung.id ?? "",
                className: "team-block",
                label: <TeamBlockHeader veranstaltung={veranstaltung} />,
                extra: expanded ? (extrasExpanded ?? extrasComponent) : extrasComponent,
                children: renderWhenInView ? contentComponent : null,
              },
            ]}
            onChange={onChange}
            size="small"
            style={{ borderColor: backgroundColor }}
          />
        )}
      </Col>
    </ConfigProvider>
  );
}
