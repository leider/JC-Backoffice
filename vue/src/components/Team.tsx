import React, { useEffect, useState } from "react";
import { allUsers, veranstaltungenForTeam } from "@/commons/loader-for-react";
import { Button, Col, Collapse, Form, Radio, Row, Select, Space, theme, Typography } from "antd";
import TeamBlockAdmin from "@/components/TeamBlockAdmin";
import groupBy from "lodash/groupBy";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import { useAuth } from "@/commons/auth";
import { useSearchParams } from "react-router-dom";
import { IconForSmallBlock } from "@/components/Icon";
import ButtonWithIcon from "@/widgets-react/ButtonWithIcon";

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
            expandIcon={({ isActive }) =>
              isActive ? <CaretDown size={20} style={{ color: "#FFF" }} /> : <CaretRight size={20} style={{ color: "#FFF" }} />
            }
          >
            <Collapse.Panel
              key={monat}
              header={
                <Typography.Title level={3} style={{ margin: 0, color: "#FFF" }}>
                  {monat}
                </Typography.Title>
              }
              className="monat-header"
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
  const [search, setSearch] = useSearchParams();

  const [usersAsOptions, setUsersAsOptions] = useState<{ label: string; value: string }[] | undefined>([]);

  async function loadUsers() {
    const users = await allUsers();
    setUsersAsOptions(users.map((user) => ({ label: user.name, value: user.id })));
  }

  const [veranstaltungen, setVeranstaltungen] = useState<Veranstaltung[]>([]);
  async function loadVeranstaltungen(period: "zukuenftige" | "vergangene" | "alle") {
    const result = await veranstaltungenForTeam(period);
    setVeranstaltungen(result);
  }
  useEffect(() => {
    loadUsers();
  }, []);

  //const context = useAppContext();
  const { context } = useAuth();
  const [realadmin, setRealadmin] = useState<boolean>(false);
  useEffect(() => {
    setRealadmin(!!context?.currentUser.accessrights?.isSuperuser);
  }, [context]);

  const [veranstaltungenNachMonat, setVeranstaltungenNachMonat] = useState<{ [index: string]: Veranstaltung[] }>({});
  const [monate, setMonate] = useState<string[]>([]);
  useEffect(() => {
    const filteredVeranstaltungen = veranstaltungen.filter((v) => v.kopf.confirmed || realadmin);
    const result = groupBy(filteredVeranstaltungen, (veranst: Veranstaltung) => veranst.startDatumUhrzeit.monatLangJahrKompakt);
    setVeranstaltungenNachMonat(result);
    setMonate(Object.keys(result));
  }, [veranstaltungen]);

  const periods = [
    { label: "Zukünftige", value: "zukuenftige" },
    { label: "Vergangene", value: "vergangene" },
    { label: "Alle", value: "alle" },
  ];
  const [period, setPeriod] = useState({ label: "Zukünftige", value: "zukuenftige" });

  useEffect(() => {
    const periodOfSearch = search.get("period");
    const result = periods.find((each) => each.value === periodOfSearch);
    if (!result) {
      setPeriod(periods[0]);
      setSearch({ period: "zukuenftige" });
    } else {
      setPeriod(result);
    }
    loadVeranstaltungen((result || periods[0]).value as "zukuenftige" | "vergangene" | "alle");
  }, [search]);

  return (
    <>
      <Row justify="space-between" align="bottom">
        <Col>
          <Typography.Title level={1}>Veranstaltungen</Typography.Title>
        </Col>
        <Col>
          <Space>
            <ButtonWithIcon icon="FileEarmarkPlus" text="Neu" type="default" />
            <ButtonWithIcon icon="CalendarWeek" text="Kalender" type="default" />
            <Radio.Group
              value={period.value}
              options={[
                { label: "Zukünftige", value: "zukuenftige" },
                { label: "Vergangene", value: "vergangene" },
                { label: "Alle", value: "alle" },
              ]}
              optionType="button"
              buttonStyle="outline"
              onChange={(e) => {
                setSearch({ period: e.target.value });
              }}
            ></Radio.Group>
          </Space>
        </Col>
      </Row>
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
