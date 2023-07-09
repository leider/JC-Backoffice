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
import { UsersAsOption } from "@/components/team/UserMultiSelect";
import { useQuery } from "@tanstack/react-query";

function Team() {
  const [usersAsOptions, setUsersAsOptions] = useState<UsersAsOption[] | undefined>([]);

  const veranstQuery = useQuery({
    queryKey: ["veranstaltung"],
    queryFn: () => veranstaltungenForTeam("zukuenftige"),
  });
  const userQuery = useQuery({ queryKey: ["users"], queryFn: allUsers });

  const [veranstaltungen, setVeranstaltungen] = useState<Veranstaltung[]>([]);
  useEffect(() => {
    if (veranstQuery.data) {
      setVeranstaltungen(veranstQuery.data);
    }
  }, [veranstQuery.data]);

  useEffect(() => {
    if (userQuery.data) {
      setUsersAsOptions(userQuery.data.map((user) => ({ label: user.name, value: user.id })));
    }
  }, [userQuery.data]);

  const { context } = useAuth();
  const [realadmin, setRealadmin] = useState<boolean>(false);
  useEffect(() => {
    const accessrights = context?.currentUser.accessrights;
    setRealadmin(!!accessrights?.isSuperuser);
  }, [context]);

  const [veranstaltungenNachMonat, setVeranstaltungenNachMonat] = useState<{
    [index: string]: Veranstaltung[];
  }>({});
  const [monate, setMonate] = useState<string[]>([]);

  document.title = "Team";
  useEffect(() => {
    const filteredVeranstaltungen = veranstaltungen.filter((v) => v.kopf.confirmed || realadmin);
    const result = groupBy(filteredVeranstaltungen, (veranst: Veranstaltung) => veranst.startDatumUhrzeit.monatLangJahrKompakt);
    setVeranstaltungenNachMonat(result);
    setMonate(Object.keys(result));
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
          extra={[
            <ButtonWithIcon
              key="cal"
              icon="CalendarWeek"
              text="Kalender"
              type="default"
              href={`${window.location.origin.replace(/https|http/, "webcal")}/ical/`}
            />,
          ]}
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
