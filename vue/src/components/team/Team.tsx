import React, { useEffect, useMemo, useState } from "react";
import { konzerteForTeam, vermietungenForTeam } from "@/commons/loader.ts";
import { Button, Col, Drawer, Dropdown, Row, Space } from "antd";
import groupBy from "lodash/groupBy";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import TeamMonatGroup from "@/components/team/TeamMonatGroup";
import TeamCalendar from "@/components/team/TeamCalendar";
import { useQueries } from "@tanstack/react-query";
import { TeamContext } from "@/components/team/Veranstaltungen.tsx";
import ButtonIcal from "@/components/team/ButtonIcal.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { useSearchParams } from "react-router-dom";
import sortBy from "lodash/sortBy";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import reverse from "lodash/reverse";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";

function Team() {
  useDirtyBlocker(false);

  const [search, setSearch] = useSearchParams();
  const periods = useMemo(() => {
    return [
      {
        label: "Zukünftige",
        key: "zukuenftige",
        onClick: () => setSearch({ period: "zukuenftige" }),
      },
      {
        label: "Vergangene",
        key: "vergangene",
        onClick: () => setSearch({ period: "vergangene" }),
      },
    ];
  }, [setSearch]);

  const [period, setPeriod] = useState<string>("Zukünftige");

  const selectedPeriod: "zukuenftige" | "vergangene" | "alle" = useMemo(() => {
    return (search.get("period") || periods[0].key) as "zukuenftige" | "vergangene" | "alle";
  }, [periods, search]);

  useEffect(() => {
    const periodOfSearch = search.get("period");
    const result = periods.find((each) => each.key === periodOfSearch);
    if (!result) {
      setSearch({ period: periods[0].key });
      setPeriod("Zukünftige");
    } else {
      setPeriod(result.label);
    }
  }, [periods, search, setSearch]);

  const queryResult = useQueries({
    queries: [
      { queryKey: ["veranstaltung", selectedPeriod], queryFn: () => konzerteForTeam(selectedPeriod), staleTime: 1000 * 60 * 2 },
      { queryKey: ["vermietung", selectedPeriod], queryFn: () => vermietungenForTeam(selectedPeriod), staleTime: 1000 * 60 * 2 },
    ],
    combine: ([a, b]) => {
      if (a?.data && b?.data) {
        return [...a.data, ...b.data];
      }
      return [];
    },
  });

  const alle = useMemo(() => {
    const sortedAscending = sortBy(queryResult, "startDate") as Veranstaltung[];
    return selectedPeriod !== "zukuenftige" ? reverse(sortedAscending) : sortedAscending;
  }, [queryResult, selectedPeriod]);

  const { allUsers, currentUser } = useJazzContext();

  const usersAsOptions = useMemo(() => allUsers.map((user) => ({ label: user.name, value: user.id, kann: user.kannSections })), [allUsers]);

  const [realadmin, setRealadmin] = useState<boolean>(false);
  useEffect(() => {
    setRealadmin(currentUser.accessrights.isSuperuser);
  }, [currentUser.accessrights.isSuperuser]);

  const [veranstaltungenNachMonat, setVeranstaltungenNachMonat] = useState<{
    [index: string]: Veranstaltung[];
  }>({});
  const [monate, setMonate] = useState<string[]>([]);

  document.title = "Team";
  useEffect(() => {
    const filtered = alle.filter((v) => v.kopf.confirmed || realadmin);
    const result = groupBy(filtered, (veranst: Veranstaltung) => veranst.startDatumUhrzeit.monatLangJahrKompakt);
    setVeranstaltungenNachMonat(result);
    setMonate(Object.keys(result));
  }, [alle, realadmin]);

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
            buttons={[
              <Dropdown
                key="periods"
                menu={{
                  items: periods,
                }}
              >
                <Button>
                  <Space>
                    {period}
                    <IconForSmallBlock iconName="ChevronDown" />
                  </Space>
                </Button>
              </Dropdown>,
            ]}
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
