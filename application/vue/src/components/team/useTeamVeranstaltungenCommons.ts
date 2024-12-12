import { useSearchParams } from "react-router";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { konzerteForTeam, vermietungenForTeam } from "@/commons/loader.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import sortBy from "lodash/sortBy";
import reverse from "lodash/reverse";
import applyTeamFilter from "@/components/team/TeamFilter/applyTeamFilter.ts";
import groupBy from "lodash/groupBy";
import TeamFilter from "@/components/team/TeamFilter/TeamFilter.tsx";

export const useTeamVeranstaltungenCommons = (periodsToShow: string[]) => {
  const [search, setSearch] = useSearchParams();
  const { allUsers, filter } = useJazzContext();

  const [period, setPeriod] = useState<string>("Zukünftige");

  const periods = useMemo(() => {
    return [
      { label: "Zukünftige", key: "zukuenftige", onClick: () => setSearch({ period: "zukuenftige" }) },
      { label: "Vergangene", key: "vergangene", onClick: () => setSearch({ period: "vergangene" }) },
      { label: "Alle", key: "alle", onClick: () => setSearch({ period: "alle" }) },
    ].filter((each) => periodsToShow.includes(each.key));
  }, [periodsToShow, setSearch]);

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
      { queryKey: ["konzert", selectedPeriod], queryFn: () => konzerteForTeam(selectedPeriod), staleTime: 1000 * 60 * 2 },
      { queryKey: ["vermietung", selectedPeriod], queryFn: () => vermietungenForTeam(selectedPeriod), staleTime: 1000 * 60 * 2 },
    ],
    combine: ([a, b]) => {
      if (a?.data && b?.data) {
        return [...a.data, ...b.data];
      }
      return [] as Veranstaltung[];
    },
  });

  const veranstaltungen = useMemo(() => {
    const additionals = queryResult.flatMap((res) => res.createGhostsForOverview() as Veranstaltung[]);
    const sortedAscending = sortBy(queryResult.concat(additionals), "startDate") as Veranstaltung[];
    return selectedPeriod !== "zukuenftige" ? reverse(sortedAscending) : sortedAscending;
  }, [queryResult, selectedPeriod]);

  const usersAsOptions = useMemo(() => allUsers.map((user) => ({ label: user.name, value: user.id, kann: user.kannSections })), [allUsers]);

  const [veranstaltungenNachMonat, setVeranstaltungenNachMonat] = useState<{
    [index: string]: Veranstaltung[];
  }>({});
  const [monate, setMonate] = useState<string[]>([]);

  useEffect(() => {
    if (veranstaltungen.length === 0) {
      return;
    }
    const filtered = veranstaltungen.filter(applyTeamFilter(filter));
    const result = groupBy(filtered, (veranst) => veranst.startDatumUhrzeit.monatLangJahrKompakt);
    setVeranstaltungenNachMonat(result);
    setMonate(Object.keys(result));
  }, [filter, veranstaltungen]);

  const filterTags = TeamFilter();

  return { period, usersAsOptions, veranstaltungenNachMonat, filterTags, monate, periods, veranstaltungen };
};
