import React, { useContext, useEffect, useMemo, useState } from "react";
import { Col, Collapse, Row, theme, Typography } from "antd";
import TeamBlockAdmin from "@/components/team/TeamBlock/TeamBlockAdmin.tsx";
import Konzert from "jc-shared/konzert/konzert.ts";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import TeamBlockNormal from "@/components/team/TeamBlock/TeamBlockNormal.tsx";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import TeamBlockVermietung from "@/components/team/TeamBlock/TeamBlockVermietung.tsx";
import { TeamContext } from "@/components/team/TeamContext.ts";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";
import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";
import map from "lodash/map";
import keys from "lodash/keys";

interface MonatGroupProps {
  monat: string;
  renderTeam?: boolean;
}

export default function TeamMonatGroup({ monat, renderTeam = false }: MonatGroupProps) {
  const { veranstaltungenNachMonat } = useContext(TeamContext);
  const veranstaltungen = veranstaltungenNachMonat[monat];
  const { token } = theme.useToken();

  const byDay = useMemo(() => groupBy(veranstaltungen, "startDatumUhrzeit.tagMonatJahrKompakt"), [veranstaltungen]);

  const initiallyExpanded = useMemo(() => {
    const jetzt = new DatumUhrzeit();
    const ersterDesMonats = DatumUhrzeit.forMonatLangJahrKompakt(monat);
    return ersterDesMonats.istVor(jetzt.plus({ monate: 1 })) && ersterDesMonats.istNach(jetzt.minus({ monate: 1 }));
  }, [monat]);

  const [expanded, setExpanded] = useState<boolean>(initiallyExpanded);

  const [yymm, setYymm] = useState<string>("");
  useEffect(() => {
    const minDatum = veranstaltungen[0].startDatumUhrzeit;
    setYymm(minDatum.fuerUnterseiten);
    const jetzt = new DatumUhrzeit();
    setExpanded(minDatum.istVor(jetzt.plus({ monate: 1 })) && minDatum.istNach(jetzt.minus({ monate: 1 })));
  }, [veranstaltungen]);

  const isDarkMode = useMemo(() => {
    return token.colorBgBase === "#101010";
  }, [token.colorBgBase]);

  return (
    <>
      <Row gutter={0}>
        <Col span={24}>
          <Collapse
            size={"small"}
            activeKey={expanded ? monat : ""}
            onChange={() => setExpanded(!expanded)}
            expandIcon={({ isActive }) =>
              isActive ? <CaretDown size={14} style={{ color: "#FFF" }} /> : <CaretRight size={14} style={{ color: "#FFF" }} />
            }
            items={[
              {
                key: monat,
                className: "monat-header",
                style: { backgroundColor: token.colorPrimary },
                label: (
                  <Row justify="space-between" align="bottom">
                    <Col>
                      <Typography.Title level={4} style={{ margin: 0, color: "#FFF" }}>
                        {monat}
                      </Typography.Title>
                    </Col>
                    <Col>
                      <ButtonWithIconAndLink
                        text="Pressetexte"
                        to={{ pathname: `/team/${yymm}`, search: "tab=pressetexte" }}
                        icon="FileText"
                        color="#FFF"
                        ghost
                        smallIcon
                        tooltipTitle="Pressetexte"
                      />
                      <ButtonWithIconAndLink
                        text="Übersicht"
                        to={{ pathname: `/team/${yymm}`, search: "tab=uebersicht" }}
                        icon="FileSpreadsheet"
                        color="#FFF"
                        ghost
                        smallIcon
                        tooltipTitle="Übersicht"
                      />
                    </Col>
                  </Row>
                ),
              },
            ]}
          />
        </Col>
      </Row>
      <Row
        gutter={[4, 4]}
        style={{ marginBottom: "18px", backgroundColor: isDarkMode ? "#3d3d3d" : "#d3d3d3", marginLeft: 0, marginRight: 0 }}
      >
        {map(keys(byDay), (day, idx) => (
          <Col xs={24} sm={12} lg={8} xl={6} xxl={4} key={day + idx} style={{ marginBottom: "4px" }}>
            {map(sortBy(byDay[day], "startDatumUhrzeit.toISOString"), (veranstaltung) => {
              return renderTeam ? (
                <Row key={veranstaltung.id}>{<TeamBlockNormal veranstaltung={veranstaltung as Konzert} initiallyOpen={expanded} />}</Row>
              ) : veranstaltung.isVermietung ? (
                <Row key={veranstaltung.id}>
                  {<TeamBlockVermietung vermietung={veranstaltung as Vermietung} initiallyOpen={expanded} />}
                </Row>
              ) : (
                <Row key={veranstaltung.id}>{<TeamBlockAdmin veranstaltung={veranstaltung as Konzert} initiallyOpen={expanded} />}</Row>
              );
            })}
          </Col>
        ))}
      </Row>
    </>
  );
}
