import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { konzerteForTeam, vermietungenForTeam } from "@/rest/loader.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import sortBy from "lodash/sortBy";
import reverse from "lodash/reverse";
import applyTeamFilter from "@/components/team/TeamFilter/applyTeamFilter.ts";
import groupBy from "lodash/groupBy";
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
      { queryKey: ["konzert", selectedPeriod], queryFn: () => konzerteForTeam(selectedPeriod), staleTime: 1000 * 60 * 30 },
      { queryKey: ["vermietung", selectedPeriod], queryFn: () => vermietungenForTeam(selectedPeriod), staleTime: 1000 * 60 * 30 },
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

  const filtered = useMemo(() => filter(veranstaltungen, applyTeamFilter(teamFilter)), [teamFilter, veranstaltungen]);

  const veranstaltungenNachMonat = useMemo(() => {
    if (veranstaltungen.length === 0) {
      return {};
    }
    return groupBy(filtered, "startDatumUhrzeit.monatLangJahrKompakt");
  }, [veranstaltungen.length, filtered]);

  const monate = useMemo(() => {
    return keys(veranstaltungenNachMonat);
  }, [veranstaltungenNachMonat]);

  return { period, usersAsOptions, veranstaltungenNachMonat, monate, periods, veranstaltungen, filtered };
};
