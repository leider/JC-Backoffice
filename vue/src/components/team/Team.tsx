import React, { useEffect, useMemo, useState } from "react";
import { konzerteForTeam } from "@/commons/loader.ts";
import { Col, Drawer, Row, Space } from "antd";
import groupBy from "lodash/groupBy";
import Konzert from "../../../../shared/konzert/konzert.ts";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import TeamMonatGroup from "@/components/team/TeamMonatGroup";
import TeamCalendar from "@/components/team/TeamCalendar";
import { useQuery } from "@tanstack/react-query";
import { TeamContext } from "@/components/team/Veranstaltungen.tsx";
import ButtonIcal from "@/components/team/ButtonIcal.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";

function Team() {
  useDirtyBlocker(false);

  const veranstQuery = useQuery({
    queryKey: ["veranstaltung", "zukuenftige"],
    queryFn: () => konzerteForTeam("zukuenftige"),
    staleTime: 1000 * 60 * 5,
  });

  const [veranstaltungen, setVeranstaltungen] = useState<Konzert[]>([]);
  useEffect(() => {
    if (veranstQuery.data) {
      setVeranstaltungen(veranstQuery.data);
    }
  }, [veranstQuery.data]);

  const { allUsers, currentUser } = useJazzContext();

  const usersAsOptions = useMemo(() => allUsers.map((user) => ({ label: user.name, value: user.id, kann: user.kannSections })), [allUsers]);

  const [realadmin, setRealadmin] = useState<boolean>(false);
  useEffect(() => {
    setRealadmin(currentUser.accessrights.isSuperuser);
  }, [currentUser.accessrights.isSuperuser]);

  const [veranstaltungenNachMonat, setVeranstaltungenNachMonat] = useState<{
    [index: string]: Konzert[];
  }>({});
  const [monate, setMonate] = useState<string[]>([]);

  document.title = "Team";
  useEffect(() => {
    const filteredVeranstaltungen = veranstaltungen.filter((v) => v.kopf.confirmed || realadmin);
    const result = groupBy(filteredVeranstaltungen, (veranst: Konzert) => veranst.startDatumUhrzeit.monatLangJahrKompakt);
    setVeranstaltungenNachMonat(result);
    setMonate(Object.keys(result));
  }, [veranstaltungen, realadmin]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Row gutter={8}>
        <Col>
          <JazzPageHeader
            title={
              <Space>
                Team
                <div style={{ marginTop: "-16px" }}>
                  <ButtonWithIcon key="openCal" icon="Calendar2Month" text="Zeigen" onClick={() => setDrawerOpen(true)} />
                </div>
              </Space>
            }
          />
          <TeamContext.Provider value={{ veranstaltungenNachMonat: veranstaltungenNachMonat, usersAsOptions }}>
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
