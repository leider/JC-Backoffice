import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Collapse, Row, Typography } from "antd";
import TeamBlockAdmin from "@/components/team/TeamBlock/TeamBlockAdmin.tsx";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import TeamBlockNormal from "@/components/team/TeamBlock/TeamBlockNormal.tsx";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import TeamBlockVermietung from "@/components/team/TeamBlock/TeamBlockVermietung.tsx";
import { TeamContext } from "@/components/team/Veranstaltungen.tsx";

interface MonatGroupProps {
  monat: string;
  renderTeam?: boolean;
}

export default function TeamMonatGroup({ monat, renderTeam = false }: MonatGroupProps) {
  const context = useContext(TeamContext);
  const veranstaltungenUndVermietungen = context!.veranstaltungenUndVermietungenNachMonat[monat];

  const [expanded, setExpanded] = useState<boolean>(false);
  const [yymm, setYymm] = useState<string>("");
  useEffect(() => {
    const minDatum = veranstaltungenUndVermietungen[0].startDatumUhrzeit;
    setYymm(minDatum.fuerUnterseiten);
    const jetzt = new DatumUhrzeit();
    setExpanded(minDatum.istVor(jetzt.plus({ monate: 1 })) && minDatum.istNach(jetzt.minus({ monate: 1 })));
  }, [veranstaltungenUndVermietungen]);
  const navigate = useNavigate();

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
                      <Button
                        ghost
                        icon={<IconForSmallBlock size={12} iconName="FileText" />}
                        size="small"
                        onClick={() =>
                          navigate({
                            pathname: `/team/${yymm}`,
                            search: "tab=pressetexte",
                          })
                        }
                      >
                        Pressetexte
                      </Button>
                      <Button
                        ghost
                        icon={<IconForSmallBlock size={12} iconName="FileSpreadsheet" />}
                        size="small"
                        onClick={() =>
                          navigate({
                            pathname: `/team/${yymm}`,
                            search: "tab=uebersicht",
                          })
                        }
                      >
                        Übersicht
                      </Button>
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
            <TeamBlockNormal key={index} veranstaltung={veranstaltung as Veranstaltung} initiallyOpen={expanded} />
          ) : (
            <TeamBlockAdmin key={index} veranstaltung={veranstaltung as Veranstaltung} initiallyOpen={expanded} />
          );
        })}
      </Row>
    </>
  );
}
