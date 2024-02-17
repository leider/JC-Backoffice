import React, { useContext, useEffect, useState } from "react";
import { Col, Collapse, Row, Typography } from "antd";
import TeamBlockAdmin from "@/components/team/TeamBlock/TeamBlockAdmin.tsx";
import Konzert from "../../../../shared/konzert/konzert.ts";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import TeamBlockNormal from "@/components/team/TeamBlock/TeamBlockNormal.tsx";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import TeamBlockVermietung from "@/components/team/TeamBlock/TeamBlockVermietung.tsx";
import { TeamContext } from "@/components/team/Veranstaltungen.tsx";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";

interface MonatGroupProps {
  monat: string;
  renderTeam?: boolean;
}

export default function TeamMonatGroup({ monat, renderTeam = false }: MonatGroupProps) {
  const context = useContext(TeamContext);
  const veranstaltungenUndVermietungen = context.veranstaltungenUndVermietungenNachMonat[monat];

  const [expanded, setExpanded] = useState<boolean>(false);
  const [yymm, setYymm] = useState<string>("");
  useEffect(() => {
    const minDatum = veranstaltungenUndVermietungen[0].startDatumUhrzeit;
    setYymm(minDatum.fuerUnterseiten);
    const jetzt = new DatumUhrzeit();
    setExpanded(minDatum.istVor(jetzt.plus({ monate: 1 })) && minDatum.istNach(jetzt.minus({ monate: 1 })));
  }, [veranstaltungenUndVermietungen]);

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
        {veranstaltungenUndVermietungen.map((veranstaltung, index) => {
          if (veranstaltung.isVermietung) {
            return <TeamBlockVermietung key={index} vermietung={veranstaltung as Vermietung} initiallyOpen={expanded} />;
          }
          return renderTeam ? (
            <TeamBlockNormal key={index} veranstaltung={veranstaltung as Konzert} initiallyOpen={expanded} />
          ) : (
            <TeamBlockAdmin key={index} veranstaltung={veranstaltung as Konzert} initiallyOpen={expanded} />
          );
        })}
      </Row>
    </>
  );
}
