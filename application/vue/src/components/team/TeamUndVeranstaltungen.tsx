import React, { useEffect, useMemo } from "react";
import { Button, Col, Dropdown, Row, Space } from "antd";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import ExcelMultiExportButton from "@/components/team/ExcelMultiExportButton.tsx";
import { NewButtons } from "@/components/colored/JazzButtons.tsx";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import TeamCalendar from "@/components/team/TeamCalendar.tsx";
import TeamMonatGroup from "@/components/team/TeamMonatGroup.tsx";
import { TeamContext } from "@/components/team/TeamContext.ts";
import { useTeamVeranstaltungenCommons } from "@/components/team/useTeamVeranstaltungenCommons.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import map from "lodash/map";
import { useLocation } from "react-router";

export function TeamUndVeranstaltungen() {
  const { memoizedId } = useJazzContext();
  const { pathname } = useLocation();
  useEffect(() => {
    setTimeout(() => {
      const element = document.getElementById(memoizedId ?? "");
      if (element) {
        element?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 1000);
  }, [memoizedId]);

  const forVeranstaltungen = useMemo(() => pathname === "/veranstaltungen", [pathname]);
  const { period, periods, veranstaltungen, veranstaltungenNachMonat, monate, filterTags, usersAsOptions } =
    useTeamVeranstaltungenCommons();

  const subState = useMemo(() => ({ veranstaltungenNachMonat, usersAsOptions }), [usersAsOptions, veranstaltungenNachMonat]);

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
          tags={filterTags}
          title={forVeranstaltungen ? "Veranstaltungen" : "Team"}
        />
        <TeamContext.Provider value={subState}>
          {map(monate, (monat) => (
            <TeamMonatGroup key={monat} monat={monat} renderTeam={!forVeranstaltungen} />
          ))}
        </TeamContext.Provider>
      </Col>
    </Row>
  );
}
