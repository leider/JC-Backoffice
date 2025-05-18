import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Col, Collapse, ConfigProvider } from "antd";
import TeamBlockHeader from "@/components/team/TeamBlock/TeamBlockHeader.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { expandIcon } from "@/widgets/collapseExpandIcon.tsx";
import { useInView } from "react-intersection-observer";
import { ButtonPreview } from "@/components/team/TeamBlock/ButtonPreview.tsx";
import { TeamContext } from "@/components/team/TeamContext.ts";

const DEBUG_PREVIEW_HEIGHT = false;

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
  const isAdmin = !!extrasExpanded;
  const { memoizedVeranstaltung } = useJazzContext();
  const { calcHeight, period } = useContext(TeamContext);
  const highlight = useMemo(
    () => veranstaltung.id === memoizedVeranstaltung?.veranstaltung?.id && !!memoizedVeranstaltung?.highlight,
    [memoizedVeranstaltung, veranstaltung.id],
  );
  const [expanded, setExpanded] = useState<boolean>(initiallyOpen || highlight);
  useEffect(() => {
    setExpanded(initiallyOpen || highlight);
  }, [highlight, initiallyOpen]);

  useEffect(() => {
    if (highlight) {
      setTimeout(() => {
        const element = document.getElementById(memoizedVeranstaltung?.veranstaltung?.id ?? "");
        if (element) {
          element?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 1000);
    }
  }, [highlight, memoizedVeranstaltung]);

  const placeholderHeight = calcHeight({ expanded, isAdmin, veranstaltung });

  const textColor = useMemo(() => veranstaltung.colorText, [veranstaltung]);
  const backgroundColor = useMemo(() => veranstaltung.color, [veranstaltung.color]);
  const onChange = useCallback(() => setExpanded(!expanded), [expanded]);

  const theme = useMemo(() => {
    return {
      token: { fontSizeIcon: expanded ? 18 : 14, colorText: textColor, colorBgBase: backgroundColor },
      components: { Collapse: { contentBg: backgroundColor, headerBg: backgroundColor } },
    };
  }, [backgroundColor, expanded, textColor]);

  const extrasComponent = <ButtonPreview veranstaltung={veranstaltung} />;

  const { inView, ref } = useInView({ triggerOnce: period !== "Alle" });
  const renderWhenInView = useMemo(
    () => inView || veranstaltung.id === memoizedVeranstaltung?.veranstaltung?.id,
    [inView, memoizedVeranstaltung, veranstaltung],
  );

  return (
    <ConfigProvider theme={theme}>
      <Col
        id={veranstaltung.id}
        ref={ref}
        span={24}
        style={
          highlight
            ? {
                border: `solid 4px white`,
                boxShadow: "0 0 40px var(--ant-color-text-secondary)",
              }
            : undefined
        }
      >
        {DEBUG_PREVIEW_HEIGHT && (
          <div
            style={{ backgroundColor: "black", height: placeholderHeight, width: 20, position: "absolute", top: 0, left: 0, zIndex: 100 }}
          />
        )}
        {renderWhenInView ? (
          // eslint-disable-next-line sonarjs/no-nested-conditional
          veranstaltung.ghost ? (
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
          )
        ) : (
          <div style={{ backgroundColor, height: placeholderHeight }} />
        )}
      </Col>
    </ConfigProvider>
  );
}
