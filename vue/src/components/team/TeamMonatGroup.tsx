import React, { useContext, useEffect, useMemo, useState } from "react";
import { Col, Collapse, Row, Typography } from "antd";
import TeamBlockAdmin from "@/components/team/TeamBlock/TeamBlockAdmin.tsx";
import Konzert from "jc-shared/konzert/konzert.ts";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import TeamBlockNormal from "@/components/team/TeamBlock/TeamBlockNormal.tsx";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import TeamBlockVermietung from "@/components/team/TeamBlock/TeamBlockVermietung.tsx";
import { TeamContext } from "@/components/team/Veranstaltungen.tsx";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";
import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";

interface MonatGroupProps {
  monat: string;
  renderTeam?: boolean;
}

export default function TeamMonatGroup({ monat, renderTeam = false }: MonatGroupProps) {
  const { veranstaltungenNachMonat } = useContext(TeamContext);
  const veranstaltungen = veranstaltungenNachMonat[monat];

  const byDay = useMemo(() => groupBy(veranstaltungen, (veranst) => veranst.startDatumUhrzeit.tagMonatJahrKompakt), [veranstaltungen]);

  const [expanded, setExpanded] = useState<boolean>(false);
  const [yymm, setYymm] = useState<string>("");
  useEffect(() => {
    const minDatum = veranstaltungen[0].startDatumUhrzeit;
    setYymm(minDatum.fuerUnterseiten);
    const jetzt = new DatumUhrzeit();
    setExpanded(minDatum.istVor(jetzt.plus({ monate: 1 })) && minDatum.istNach(jetzt.minus({ monate: 1 })));
  }, [veranstaltungen]);

  return (
    <>
      <Row gutter={0} style={{ backgroundColor: "#d3d3d3" }}>
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
      <Row gutter={[4, 4]} style={{ marginBottom: "18px", backgroundColor: "#d3d3d3", marginLeft: 0, marginRight: 0 }}>
        {Object.keys(byDay).map((day, idx) => {
          return (
            <Col xs={24} sm={12} lg={8} xl={6} xxl={4} key={day + idx}>
              {sortBy(byDay[day], (v) => v.startDatumUhrzeit.toISOString).map((veranstaltung) => {
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
          );
        })}
      </Row>
    </>
  );
}
