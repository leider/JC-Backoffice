import React, { useEffect, useState } from "react";
import { allUsers, veranstaltungenForTeam } from "@/commons/loader-for-react";
import { Col, Row } from "antd";
import groupBy from "lodash/groupBy";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { useAuth } from "@/commons/auth";
import ButtonWithIcon from "@/widgets-react/ButtonWithIcon";
import { PageHeader } from "@ant-design/pro-layout";
import TeamMonatGroup from "@/components/team/TeamMonatGroup";
import TeamCalendar from "@/components/team/TeamCalendar";

function Team() {
  const [usersAsOptions, setUsersAsOptions] = useState<{ label: string; value: string }[] | undefined>([]);

  async function loadUsers() {
    const users = await allUsers();
    setUsersAsOptions(users.map((user) => ({ label: user.name, value: user.id })));
  }

  const [veranstaltungen, setVeranstaltungen] = useState<Veranstaltung[]>([]);
  async function loadVeranstaltungen() {
    const result = await veranstaltungenForTeam("zukuenftige");
    setVeranstaltungen(result);
  }
  useEffect(() => {
    loadUsers();
    loadVeranstaltungen();
  }, []);

  const { context } = useAuth();
  const [realadmin, setRealadmin] = useState<boolean>(false);
  const [veranstaltungenNachMonat, setVeranstaltungenNachMonat] = useState<{ [index: string]: Veranstaltung[] }>({});
  const [monate, setMonate] = useState<string[]>([]);
  useEffect(() => {
    const filteredVeranstaltungen = veranstaltungen.filter((v) => v.kopf.confirmed || realadmin);
    const result = groupBy(filteredVeranstaltungen, (veranst: Veranstaltung) => veranst.startDatumUhrzeit.monatLangJahrKompakt);
    setVeranstaltungenNachMonat(result);
    setMonate(Object.keys(result));
    const accessrights = context?.currentUser.accessrights;
    setRealadmin(!!accessrights?.isSuperuser);
  }, [veranstaltungen, realadmin, context]);

  return (
    <Row gutter={8}>
      <Col xs={24} xl={16}>
        <PageHeader
          footer={
            <p>
              <b>Kasse 1</b> und <b>Techniker 1</b> sind am Abend jeweils die <b>Verantwortlichen</b>. Bitte denke daran, rechtzeitig vor
              der Veranstaltung da zu sein!
            </p>
          }
          title="Team"
          extra={[<ButtonWithIcon key="cal" icon="CalendarWeek" text="Kalender" type="default" />]}
        />
        {monate.map((monat) => {
          return (
            <TeamMonatGroup
              key={monat}
              monat={monat}
              veranstaltungen={veranstaltungenNachMonat[monat]}
              usersAsOptions={usersAsOptions || []}
              renderTeam={true}
            />
          );
        })}
      </Col>
      <Col xs={24} xl={8} style={{ zIndex: 0 }}>
        <TeamCalendar />
      </Col>
    </Row>
  );
}

export default Team;
