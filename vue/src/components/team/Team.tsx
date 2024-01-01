import React, { useEffect, useState } from "react";
import { allUsers, veranstaltungenForTeam } from "@/commons/loader.ts";
import { Col, Drawer, Row, Space } from "antd";
import groupBy from "lodash/groupBy";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { useAuth } from "@/commons/authConsts.ts";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { PageHeader } from "@ant-design/pro-layout";
import TeamMonatGroup from "@/components/team/TeamMonatGroup";
import TeamCalendar from "@/components/team/TeamCalendar";
import { useQuery } from "@tanstack/react-query";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";
import { TeamContext } from "@/components/team/Veranstaltungen.tsx";
import ButtonIcal from "@/components/team/ButtonIcal.tsx";

function Team() {
  const [usersAsOptions, setUsersAsOptions] = useState<LabelAndValue[]>([]);

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
    setRealadmin(context.currentUser.accessrights.isSuperuser);
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

  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Row gutter={8}>
        <Col>
          <PageHeader
            footer={
              <p>
                <b>Kasse 1</b> und <b>Techniker 1</b> sind am Abend jeweils die <b>Verantwortlichen</b>. Bitte denke daran, rechtzeitig vor
                der Veranstaltung da zu sein!
              </p>
            }
            title={
              <Space>
                Team
                <div style={{ marginTop: "-16px" }}>
                  <ButtonWithIcon key="openCal" icon="Calendar2Month" text="Zeigen" onClick={() => setDrawerOpen(true)} />
                </div>
              </Space>
            }
          />
          <TeamContext.Provider value={{ veranstaltungenUndVermietungenNachMonat: veranstaltungenNachMonat, usersAsOptions }}>
            {monate.map((monat) => {
              return <TeamMonatGroup key={monat} monat={monat} renderTeam />;
            })}
          </TeamContext.Provider>
        </Col>
      </Row>
      <Drawer extra={<ButtonIcal />} placement="right" onClose={() => setDrawerOpen(false)} open={drawerOpen} size="large">
        <TeamCalendar />
      </Drawer>
    </>
  );
}

export default Team;
