import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { konzerteForTeam, vermietungenForTeam } from "@/rest/loader.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import sortBy from "lodash/sortBy";
import reverse from "lodash/reverse";
import applyTeamFilter from "@/components/team/TeamFilter/applyTeamFilter.ts";
import groupBy from "lodash/groupBy";
import TeamFilter from "@/components/team/TeamFilter/TeamFilter.tsx";
import map from "lodash/map";
import filter from "lodash/filter";
import capitalize from "lodash/capitalize";
import keys from "lodash/keys";

export type Period = "zukuenftige" | "vergangene" | "alle";

export const useTeamVeranstaltungenCommons = () => {
  const [search, setSearch] = useState<Period>("zukuenftige");
  const { allUsers, currentUser, teamFilter } = useJazzContext();

  const periodsToShow = useMemo(
    () => (currentUser.accessrights.isOrgaTeam ? ["zukuenftige", "vergangene", "alle"] : ["zukuenftige", "vergangene"]) as Period[],
    [currentUser],
  );

  const setSelectedPeriod = useCallback((period: Period) => {
    localStorage.setItem("veranstaltungenPeriod", period);
    setSearch(period);
  }, []);

  useEffect(() => {
    const period = (localStorage.getItem("veranstaltungenPeriod") ?? "zukuenftige") as Period;
    if (periodsToShow.includes(period)) {
      setSearch(period);
    } else {
      setSearch("zukuenftige");
    }
  }, [periodsToShow]);

  const [period, setPeriod] = useState<string>("Zukünftige");

  const periods = useMemo(() => {
    return map(periodsToShow, (period) => {
      return {
        label: period === "zukuenftige" ? "Zukünftige" : capitalize(period),
        key: period,
        onClick: () => setSelectedPeriod(period),
      };
    });
  }, [periodsToShow, setSelectedPeriod]);

  const selectedPeriod: Period = useMemo(() => {
    return search || periods[0].key;
  }, [periods, search]);

  useEffect(() => {
    setPeriod(selectedPeriod === "zukuenftige" ? "Zukünftige" : capitalize(selectedPeriod));
  }, [selectedPeriod]);

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

  const usersAsOptions = useMemo(() => map(allUsers, "asUserAsOption"), [allUsers]);

  const [veranstaltungenNachMonat, setVeranstaltungenNachMonat] = useState<{
    [index: string]: Veranstaltung[];
  }>({});
  const [monate, setMonate] = useState<string[]>([]);

  useEffect(() => {
    if (veranstaltungen.length === 0) {
      return;
    }
    const filtered = filter(veranstaltungen, applyTeamFilter(teamFilter));
    const result = groupBy(filtered, "startDatumUhrzeit.monatLangJahrKompakt");
    setVeranstaltungenNachMonat(result);
    setMonate(keys(result));
  }, [teamFilter, veranstaltungen]);

  const filterTags = TeamFilter();

  return { period, usersAsOptions, veranstaltungenNachMonat, filterTags, monate, periods, veranstaltungen };
};
