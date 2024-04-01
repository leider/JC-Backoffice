import React, { createContext, useEffect, useMemo, useState } from "react";
import { konzerteForTeam, vermietungenForTeam } from "@/commons/loader.ts";
import { Button, Col, Dropdown, Row, Space } from "antd";
import groupBy from "lodash/groupBy";
import Konzert from "jc-shared/konzert/konzert.ts";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import TeamMonatGroup from "@/components/team/TeamMonatGroup";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { NewButtons } from "@/components/colored/JazzButtons.tsx";
import ExcelMultiExportButton from "@/components/team/ExcelMultiExportButton.tsx";
import sortBy from "lodash/sortBy";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useQueries } from "@tanstack/react-query";
import { UserWithKann } from "@/components/team/MitarbeiterMultiSelect.tsx";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import reverse from "lodash/reverse";
import TeamCalendar from "@/components/team/TeamCalendar.tsx";
import useFilterAsTags from "@/components/team/TeamFilter.tsx";
import applyTeamFilter from "@/components/team/applyTeamFilter.ts";

export const TeamContext = createContext<{
  veranstaltungenNachMonat: {
    [index: string]: Veranstaltung[];
  };
  usersAsOptions: UserWithKann[];
}>({ veranstaltungenNachMonat: {}, usersAsOptions: [] });

export default function Veranstaltungen() {
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
      {
        label: "Alle",
        key: "alle",
        onClick: () => setSearch({ period: "alle" }),
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
      {
        queryKey: ["konzert", selectedPeriod],
        queryFn: () => konzerteForTeam(selectedPeriod),
        staleTime: 1000 * 60 * 2,
      },
      {
        queryKey: ["vermietung", selectedPeriod],
        queryFn: () => vermietungenForTeam(selectedPeriod),
        staleTime: 1000 * 60 * 2,
      },
    ],
    combine: ([a, b]) => {
      if (a?.data && b?.data) {
        return [...a.data, ...b.data];
      }
      return [];
    },
  });

  const veranstaltungen = useMemo(() => {
    const additionals = queryResult.flatMap((res) => res.createGhostsForOverview() as (Konzert | Vermietung)[]);

    const sortedAscending = sortBy(queryResult.concat(additionals), "startDate") as Veranstaltung[];
    return selectedPeriod !== "zukuenftige" ? reverse(sortedAscending) : sortedAscending;
  }, [queryResult, selectedPeriod]);

  const { allUsers, currentUser, filter } = useJazzContext();
  const navigate = useNavigate();
  const location = useLocation();

  const usersAsOptions = useMemo(
    () =>
      allUsers.map((user) => ({
        label: user.name,
        value: user.id,
        kann: user.kannSections,
      })),
    [allUsers],
  );

  const [veranstaltungenUndVermietungenNachMonat, setVeranstaltungenUndVermietungenNachMonat] = useState<{
    [index: string]: Veranstaltung[];
  }>({});
  const [monate, setMonate] = useState<string[]>([]);

  document.title = "Veranstaltungen";
  useEffect(() => {
    const accessrights = currentUser.accessrights;
    if (currentUser.id && location.pathname !== "/team" && !accessrights.isOrgaTeam) {
      navigate("/team");
    }
  }, [currentUser.accessrights, currentUser.id, location.pathname, navigate]);

  useEffect(() => {
    if (veranstaltungen.length === 0) {
      return;
    }
    const filtered = veranstaltungen.filter(applyTeamFilter(filter));
    const result = groupBy(filtered, (veranst) => veranst.startDatumUhrzeit.monatLangJahrKompakt);
    setVeranstaltungenUndVermietungenNachMonat(result);
    setMonate(Object.keys(result));
  }, [filter, veranstaltungen]);

  const filterTags = useFilterAsTags();

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
        <TeamContext.Provider value={{ veranstaltungenNachMonat: veranstaltungenUndVermietungenNachMonat, usersAsOptions }}>
          {monate.map((monat) => {
            return <TeamMonatGroup key={monat} monat={monat} />;
          })}
        </TeamContext.Provider>
      </Col>
    </Row>
  );
}
