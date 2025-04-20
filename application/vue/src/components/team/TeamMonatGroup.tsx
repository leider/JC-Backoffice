import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
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

interface MonatGroupProps {
  readonly monat: string;
  readonly renderTeam?: boolean;
}

export default function TeamMonatGroup({ monat, renderTeam = false }: MonatGroupProps) {
  const { veranstaltungenNachMonat } = useContext(TeamContext);
  const { isDarkMode, brightText } = useJazzContext();
  const veranstaltungen = veranstaltungenNachMonat[monat];
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

  const [expanded, setExpanded] = useState<boolean>(false);

  const [yymm, setYymm] = useState<string>("");
  useEffect(() => {
    const minDatum = veranstaltungen[0].startDatumUhrzeit;
    setYymm(minDatum.fuerUnterseiten);
    const jetzt = new DatumUhrzeit();
    setExpanded(minDatum.istVor(jetzt.plus({ monate: 1 })) && minDatum.istNach(jetzt.minus({ monate: 1 })));
  }, [veranstaltungen]);

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
        {map(keys(byDay), (day, idx) => (
          <Col key={day + idx} lg={8} sm={12} style={{ marginBottom: "4px" }} xl={6} xs={24} xxl={4}>
            <Typography.Text style={datumTextStyle}>{DatumUhrzeit.forGermanString(day)?.format("dd, DD. MMMM")}</Typography.Text>
            {map(sortBy(byDay[day], "startDatumUhrzeit.toISOString"), (veranstaltung) => {
              return renderTeam ? (
                <Row key={veranstaltung.id}>
                  <TeamBlockNormal initiallyOpen={expanded} veranstaltung={veranstaltung} />
                </Row>
              ) : (
                <Row key={veranstaltung.id}>
                  <TeamBlockAdmin initiallyOpen={expanded} veranstaltung={veranstaltung} />
                </Row>
              );
            })}
          </Col>
        ))}
      </Row>
    </>
  );
}
