import React, { useEffect, useMemo } from "react";
import { Col, Row } from "antd";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import ExcelMultiExportButton from "@/components/team/ExcelMultiExportButton.tsx";
import { NewButtons } from "@/components/colored/JazzButtons.tsx";
import TeamCalendar from "@/components/team/TeamCalendar.tsx";
import TeamMonatGroup from "@/components/team/TeamMonatGroup.tsx";
import { TeamContext } from "@/components/team/TeamContext.ts";
import { useTeamVeranstaltungenCommons } from "@/components/team/useTeamVeranstaltungenCommons.ts";
import map from "lodash/map";
import { useLocation } from "react-router";
import TeamFilter from "@/components/team/TeamFilter/TeamFilter.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import useCalcHeight from "@/components/team/useCalcHeight.ts";
import ScrollingContent from "@/components/content/ScrollingContent.tsx";
import filter from "lodash/filter";
import { TeamPeriodsSelector } from "@/components/team/TeamPeriodsSelector.tsx";

function Monate({ monate }: { monate: string[] }) {
  console.log({ monate });
  return map(monate, (monat) => <TeamMonatGroup key={monat} monat={monat} />);
}

export function TeamUndVeranstaltungen() {
  const { pathname } = useLocation();
  const { memoizedVeranstaltung, setMemoizedVeranstaltung } = useJazzContext();
  const calcHeight = useCalcHeight();
  const forVeranstaltungen = useMemo(() => pathname === "/veranstaltungen", [pathname]);
  const { veranstaltungen, veranstaltungenNachMonat, monate, usersAsOptions, filtered, period } = useTeamVeranstaltungenCommons();

  const teamContext = useMemo(() => {
    const alleErsthelfer = map(
      filter(usersAsOptions, (u) => u.kann.includes("Ersthelfer")),
      "value",
    );
    console.log({ period });
    return { veranstaltungenNachMonat, usersAsOptions, period, calcHeight, noOfVeranstaltungen: filtered.length, alleErsthelfer };
  }, [veranstaltungenNachMonat, usersAsOptions, period, calcHeight, filtered.length]);

  useEffect(() => {
    if (!memoizedVeranstaltung) {
      setMemoizedVeranstaltung({ veranstaltung: veranstaltungen[0], highlight: false });
    }
  }, [memoizedVeranstaltung, setMemoizedVeranstaltung, veranstaltungen]);

  return (
    <Row gutter={8}>
      <Col span={24}>
        <JazzPageHeader
          buttons={[
            forVeranstaltungen && <ExcelMultiExportButton alle={veranstaltungen} key="excel" />,
            forVeranstaltungen && <NewButtons key="newButtons" />,
            <TeamPeriodsSelector key="selector" />,
            <TeamCalendar key="cal" />,
          ]}
          tags={<TeamFilter key="TeamFilter" />}
          title={forVeranstaltungen ? "Veranstaltungen" : "Team"}
        />
        <TeamContext.Provider value={teamContext}>
          <ScrollingContent>
            <Monate monate={monate} />
          </ScrollingContent>
        </TeamContext.Provider>
      </Col>
    </Row>
  );
}
