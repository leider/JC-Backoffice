import React, { useCallback, useContext, useMemo, useState } from "react";
import { Col, Collapse, Row, theme, Typography } from "antd";
import TeamBlockAdmin from "@/components/team/TeamBlock/TeamBlockAdmin.tsx";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import TeamBlockNormal from "@/components/team/TeamBlock/TeamBlockNormal.tsx";
import { TeamContext } from "@/components/team/TeamContext.ts";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";
import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";
import map from "lodash/map";
import keys from "lodash/keys";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import tinycolor from "tinycolor2";
import { expandIcon } from "@/widgets/collapseExpandIcon.tsx";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { useLocation } from "react-router";

interface MonatGroupProps {
  readonly monat: string;
  readonly renderTeam?: boolean;
}

function Monat({ expanded, veranstaltungen }: { expanded: boolean; veranstaltungen: Veranstaltung[] }) {
  const { pathname } = useLocation();
  const { isDarkMode, brightText } = useJazzContext();
  const { token } = theme.useToken();

  const datumTextStyle = useMemo(() => {
    return {
      display: "block",
      marginTop: 0,
      marginBottom: 0,
      backgroundColor: isDarkMode
        ? tinycolor(token.colorPrimary).desaturate().darken().toHexString()
        : tinycolor(token.colorPrimary).desaturate(20).brighten(20).toHexString(),
      color: brightText,
      paddingLeft: 16,
    };
  }, [brightText, isDarkMode, token.colorPrimary]);

  const byDay = useMemo(() => groupBy(veranstaltungen, "startDatumUhrzeit.tagMonatJahrKompakt"), [veranstaltungen]);
  const renderTeam = useMemo(() => pathname === "/team", [pathname]);

  const CompToRender = useMemo(() => (renderTeam ? TeamBlockNormal : TeamBlockAdmin), [renderTeam]);

  return map(keys(byDay), (day, idx) => (
    <Col key={day + idx} lg={8} sm={12} style={{ marginBottom: "4px" }} xl={6} xs={24} xxl={4}>
      <Typography.Text style={datumTextStyle}>{DatumUhrzeit.forGermanString(day)?.format("dd, DD. MMMM")}</Typography.Text>
      {map(sortBy(byDay[day], "startDatumUhrzeit.toISOString"), (veranstaltung) => (
        <Row key={veranstaltung.id}>
          <CompToRender initiallyOpen={expanded} veranstaltung={veranstaltung} />
        </Row>
      ))}
    </Col>
  ));
}

export default function TeamMonatGroup({ monat }: MonatGroupProps) {
  const { veranstaltungenNachMonat } = useContext(TeamContext);
  const veranstaltungen = veranstaltungenNachMonat[monat];
  const { isDarkMode, brightText } = useJazzContext();
  const { token } = theme.useToken();

  const minDatum = useMemo(() => veranstaltungen?.[0]?.startDatumUhrzeit ?? new DatumUhrzeit(), [veranstaltungen]);
  const yymm = useMemo(() => minDatum.fuerUnterseiten, [minDatum.fuerUnterseiten]);

  const initiallyExpanded = useMemo(() => {
    const jetzt = new DatumUhrzeit();
    return minDatum.istVor(jetzt.plus({ monate: 1 })) && minDatum.istNach(jetzt.minus({ monate: 1 }));
  }, [minDatum]);

  const [expanded, setExpanded] = useState<boolean>(initiallyExpanded);

  const expandUnexpand = useCallback(() => setExpanded(!expanded), [expanded]);
  return (
    <>
      <Row gutter={0}>
        <Col span={24}>
          <Collapse
            activeKey={expanded ? monat : ""}
            expandIcon={expandIcon({ size: 14 })}
            items={[
              {
                key: monat,
                className: "monat-header",
                style: { backgroundColor: token.colorPrimary },
                label: (
                  <Row align="bottom" justify="space-between">
                    <Col>
                      <Typography.Title level={4} style={{ margin: 0, color: brightText }}>
                        {monat}
                      </Typography.Title>
                    </Col>
                    <Col>
                      <ButtonWithIconAndLink
                        color={brightText}
                        ghost
                        icon="FileText"
                        smallIcon
                        text="Pressetexte"
                        to={{ pathname: `/team/${yymm}`, search: "tab=pressetexte" }}
                        tooltipTitle="Pressetexte"
                      />
                      <ButtonWithIconAndLink
                        color={brightText}
                        ghost
                        icon="FileSpreadsheet"
                        smallIcon
                        text="Übersicht"
                        to={{ pathname: `/team/${yymm}`, search: "tab=uebersicht" }}
                        tooltipTitle="Übersicht"
                      />
                    </Col>
                  </Row>
                ),
              },
            ]}
            onChange={expandUnexpand}
            size="small"
          />
        </Col>
      </Row>
      <Row
        gutter={[4, 4]}
        style={{ marginBottom: "18px", backgroundColor: isDarkMode ? "#3d3d3d" : "#d3d3d3", marginLeft: 0, marginRight: 0 }}
      >
        <Monat expanded={expanded} veranstaltungen={veranstaltungen} />
      </Row>
    </>
  );
}
