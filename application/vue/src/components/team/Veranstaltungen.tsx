import React, { createContext, useEffect } from "react";
import { Button, Col, Dropdown, Row, Space } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import TeamMonatGroup from "@/components/team/TeamMonatGroup";
import { NewButtons } from "@/components/colored/JazzButtons.tsx";
import ExcelMultiExportButton from "@/components/team/ExcelMultiExportButton.tsx";
import { UserWithKann } from "@/components/team/MitarbeiterMultiSelect.tsx";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import TeamCalendar from "@/components/team/TeamCalendar.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useTeamVeranstaltungenCommons } from "@/components/team/TeamUndVeranstaltungen.tsx";

export const TeamContext = createContext<{
  veranstaltungenNachMonat: {
    [index: string]: Veranstaltung[];
  };
  usersAsOptions: UserWithKann[];
}>({ veranstaltungenNachMonat: {}, usersAsOptions: [] });

export default function Veranstaltungen() {
  useDirtyBlocker(false);
  const { currentUser } = useJazzContext();

  const { periods, period, filterTags, usersAsOptions, veranstaltungenNachMonat, monate, veranstaltungen } = useTeamVeranstaltungenCommons([
    "zukuenftige",
    "vergangene",
    "alle",
  ]);

  document.title = "Veranstaltungen";

  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const accessrights = currentUser.accessrights;
    if (currentUser.id && location.pathname !== "/team" && !accessrights.isOrgaTeam) {
      navigate("/team");
    }
  }, [currentUser.accessrights, currentUser.id, location.pathname, navigate]);

  return (
    <Row gutter={8}>
      <Col span={24}>
        <JazzPageHeader
          title="Veranstaltungen"
          tags={filterTags}
          buttons={[
            <ExcelMultiExportButton key="excel" alle={veranstaltungen} />,
            <NewButtons key="newButtons" />,
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
            return <TeamMonatGroup key={monat} monat={monat} />;
          })}
        </TeamContext.Provider>
      </Col>
    </Row>
  );
}
