import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Dropdown, Space } from "antd";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import map from "lodash/map";
import { Period } from "@/components/team/useTeamVeranstaltungenCommons.ts";

export function TeamPeriodsSelector() {
  const { currentUser } = useJazzContext();
  const [period, setPeriod] = useState<Period>("Zukünftige");

  const periodsToShow = useMemo(
    () => (currentUser.accessrights.isOrgaTeam ? ["Zukünftige", "Vergangene", "Alle"] : ["Zukünftige", "Vergangene"]) as Period[],
    [currentUser],
  );

  const items = useMemo(() => map(periodsToShow, (period) => ({ label: period, key: period })), [periodsToShow]);

  useEffect(() => {
    const per = (localStorage.getItem("veranstaltungenPeriod") ?? "Zukünftige") as Period;
    const adaptedPeriod = periodsToShow.includes(per) ? per : "Zukünftige";
    setPeriod(adaptedPeriod);
  }, [periodsToShow]);

  const onClick = useCallback(({ key }: { key: string }) => {
    setPeriod(key as Period);
    localStorage.setItem("veranstaltungenPeriod", key as Period);
    window.dispatchEvent(new Event("storage"));
  }, []);

  return (
    <Dropdown key="periods" menu={{ items, onClick }}>
      <Button>
        <Space>
          {period}
          <IconForSmallBlock iconName="ChevronDown" />
        </Space>
      </Button>
    </Dropdown>
  );
}
