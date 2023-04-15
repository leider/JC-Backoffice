import React, { ReactElement, useEffect, useState } from "react";
import { allUsers, veranstaltungenForTeam } from "@/commons/loader-for-react";
import { useQueries } from "@tanstack/react-query";
import { Col, Collapse, Row, Typography } from "antd";
import TeamBlockAdmin from "@/components/TeamBlockAdmin";
import groupBy from "lodash/groupBy";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { CaretDown, CaretRight } from "react-bootstrap-icons";

interface MonatGroupProps {
  veranstaltungen: Veranstaltung[];
  usersAsOptions: { label: string; value: string }[];
  monat: string;
}

function MonatGroup({ veranstaltungen, usersAsOptions, monat }: MonatGroupProps) {
  const [expanded, setExpanded] = useState<boolean>(false);
  useEffect(() => {
    const minDatum = veranstaltungen[0].startDatumUhrzeit;
    const jetzt = new DatumUhrzeit();
    setExpanded(minDatum.istVor(jetzt.plus({ monate: 1 })) && minDatum.istNach(jetzt.minus({ monate: 1 })));
  }, [veranstaltungen]);
  return (
    <>
      <Row gutter={8}>
        <Col span={24}>
          <Collapse
            size={"small"}
            activeKey={expanded ? monat : ""}
            onChange={() => setExpanded(!expanded)}
            expandIcon={({ isActive }) => (isActive ? <CaretDown size={20} /> : <CaretRight size={20} />)}
          >
            <Collapse.Panel
              key={monat}
              header={
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {monat}
                </Typography.Title>
              }
              className="colpre"
            ></Collapse.Panel>
          </Collapse>
        </Col>
      </Row>
      <Row gutter={8}>
        {veranstaltungen.map((veranstaltung, index) => (
          <TeamBlockAdmin key={index} veranstaltung={veranstaltung} usersAsOptions={usersAsOptions || []} initiallyOpen={expanded} />
        ))}
      </Row>
    </>
  );
}

function Team() {
  const [users, veranstaltungen] = useQueries({
    queries: [
      {
        queryKey: ["users"],
        queryFn: allUsers,
      },
      {
        queryKey: ["veranstaltungen"],
        queryFn: () => veranstaltungenForTeam("alle"),
      },
    ],
  });

  function realadmin(): boolean {
    return true;
  }

  const [veranstaltungenNachMonat, setVeranstaltungenNachMonat] = useState<{ [index: string]: Veranstaltung[] }>({});
  const [monate, setMonate] = useState<string[]>([]);
  useEffect(() => {
    const filteredVeranstaltungen = veranstaltungen.data?.filter((v) => realadmin() || v.kopf.confirmed);
    const result = groupBy(filteredVeranstaltungen, (veranst: Veranstaltung) => veranst.startDatumUhrzeit.monatLangJahrKompakt);
    setVeranstaltungenNachMonat(result);
    setMonate(Object.keys(result));
  }, [veranstaltungen.data]);

  const [usersAsOptions, setUsersAsOptions] = useState<{ label: string; value: string }[] | undefined>([]);
  useEffect(() => {
    setUsersAsOptions(users.data?.map((user) => ({ label: user.id, value: user.id })));
  }, [users.data]);

  return (
    <>
      {monate.map((monat) => {
        return (
          <MonatGroup
            key={monat}
            monat={monat}
            veranstaltungen={veranstaltungenNachMonat[monat]}
            usersAsOptions={usersAsOptions || []}
          ></MonatGroup>
        );
      })}
    </>
  );
}

export default Team;
