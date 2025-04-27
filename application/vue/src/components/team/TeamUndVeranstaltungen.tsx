import React, { useMemo } from "react";
import { Button, Col, Dropdown, Row, Space, Spin } from "antd";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import ExcelMultiExportButton from "@/components/team/ExcelMultiExportButton.tsx";
import { NewButtons } from "@/components/colored/JazzButtons.tsx";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import TeamCalendar from "@/components/team/TeamCalendar.tsx";
import TeamMonatGroup from "@/components/team/TeamMonatGroup.tsx";
import { TeamContext } from "@/components/team/TeamContext.ts";
import { useTeamVeranstaltungenCommons } from "@/components/team/useTeamVeranstaltungenCommons.ts";
import map from "lodash/map";
import { useLocation } from "react-router";
import TeamFilter from "@/components/team/TeamFilter/TeamFilter.tsx";
import Lazy from "@/components/team/Lazy.tsx";

function Monate({ monate }: { monate: string[] }) {
  return map(monate, (monat) => <TeamMonatGroup key={monat} monat={monat} />);
}

export function TeamUndVeranstaltungen() {
  const { pathname } = useLocation();
  const forVeranstaltungen = useMemo(() => pathname === "/veranstaltungen", [pathname]);
  const { period, periods, veranstaltungen, veranstaltungenNachMonat, monate, usersAsOptions, filtered } = useTeamVeranstaltungenCommons();
  const subState = useMemo(
    () => ({ veranstaltungenNachMonat, usersAsOptions, period }),
    [usersAsOptions, veranstaltungenNachMonat, period],
  );

  return (
    <Row gutter={8}>
      <Col span={24}>
        <JazzPageHeader
          buttons={[
            forVeranstaltungen && <ExcelMultiExportButton alle={veranstaltungen} key="excel" />,
            forVeranstaltungen && <NewButtons key="newButtons" />,
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
            <TeamCalendar key="cal" />,
          ]}
          tags={<TeamFilter key="TeamFilter" />}
          title={forVeranstaltungen ? "Veranstaltungen" : "Team"}
        />
        <TeamContext.Provider value={subState}>
          {filtered.length > 20 ? (
            <Lazy component={<Monate monate={monate} />} loadingComponent={<Spin fullscreen size="large" spinning tip="Mooooment..." />} />
          ) : (
            <Monate monate={monate} />
          )}
        </TeamContext.Provider>
      </Col>
    </Row>
  );
}
