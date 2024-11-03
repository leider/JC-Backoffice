import React from "react";
import { Button, Col, Dropdown, Row, Space } from "antd";
import TeamMonatGroup from "@/components/team/TeamMonatGroup";
import { TeamContext } from "@/components/team/Veranstaltungen.tsx";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import TeamCalendar from "@/components/team/TeamCalendar.tsx";
import { useTeamVeranstaltungenCommons } from "@/components/team/TeamUndVeranstaltungen.tsx";

export default function Team() {
  useDirtyBlocker(false);

  const { periods, period, filterTags, usersAsOptions, veranstaltungenNachMonat, monate } = useTeamVeranstaltungenCommons([
    "zukuenftige",
    "vergangene",
  ]);

  document.title = "Team";
  return (
    <>
      <Row gutter={8}>
        <Col span={24}>
          <JazzPageHeader
            title="Team"
            tags={filterTags}
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
              <TeamCalendar key="cal" />,
            ]}
          />
          <TeamContext.Provider value={{ veranstaltungenNachMonat: veranstaltungenNachMonat, usersAsOptions }}>
            {monate.map((monat) => {
              return <TeamMonatGroup key={monat} monat={monat} renderTeam />;
            })}
          </TeamContext.Provider>
        </Col>
      </Row>
    </>
  );
}
