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

export function TeamUndVeranstaltungen({ periodsToShow }: { periodsToShow: string[] }) {
  const { memoizedId } = useJazzContext();
  useEffect(() => {
    let tries = 0;
    function tryToScroll() {
      setTimeout(() => {
        const element = document.getElementById(memoizedId ?? "");
        if (element) {
          element?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          tries = 5;
        }
      }, 200);
    }
    if (tries < 5) {
      tryToScroll();
      tries++;
    }
  }, [memoizedId]);

  const forVeranstaltungen = useMemo(() => periodsToShow.includes("alle"), [periodsToShow]);
  const { period, periods, veranstaltungen, veranstaltungenNachMonat, monate, filterTags, usersAsOptions } =
    useTeamVeranstaltungenCommons(periodsToShow);
  return (
    <Row gutter={8}>
      <Col span={24}>
        <JazzPageHeader
          title={forVeranstaltungen ? "Veranstaltungen" : "Team"}
          tags={filterTags}
          buttons={[
            forVeranstaltungen && <ExcelMultiExportButton key="excel" alle={veranstaltungen} />,
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
        />
        <TeamContext.Provider value={{ veranstaltungenNachMonat, usersAsOptions }}>
          {monate.map((monat) => {
            return <TeamMonatGroup key={monat} monat={monat} renderTeam={!forVeranstaltungen} />;
          })}
        </TeamContext.Provider>
      </Col>
    </Row>
  );
}
