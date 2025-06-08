import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { konzerteForTeam, vermietungenForTeam } from "@/rest/loader.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import sortBy from "lodash/sortBy";
import reverse from "lodash/reverse";
import applyTeamFilter from "@/components/team/TeamFilter/applyTeamFilter.ts";
import groupBy from "lodash/groupBy";
import map from "lodash/map";
import filter from "lodash/filter";
import keys from "lodash/keys";
import forEach from "lodash/forEach";

export type Period = "Zukünftige" | "Vergangene" | "Alle" | "Alle (voll)";

export const useTeamVeranstaltungenCommons = () => {
  const { allUsers, teamFilter } = useJazzContext();

  const [period, setPeriod] = useState<Period>("Zukünftige");

  useEffect(() => {
    setPeriod((localStorage.getItem("veranstaltungenPeriod") ?? "Zukünftige") as Period);
    const listener = () => {
      const newPeriod = (localStorage.getItem("veranstaltungenPeriod") ?? "Zukünftige") as Period;
      if (period !== newPeriod) {
        setPeriod(newPeriod);
      }
    };
    window.addEventListener("storage", listener);
    return () => {
      window.removeEventListener("storage", listener);
    };
  }, [period]);

  const queryResult = useQueries({
    queries: [
      { queryKey: ["konzert", period], queryFn: () => konzerteForTeam(period) },
      { queryKey: ["vermietung", period], queryFn: () => vermietungenForTeam(period) },
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
    return period !== "Zukünftige" ? reverse(sortedAscending) : sortedAscending;
  }, [queryResult, period]);

  const usersAsOptions = useMemo(() => map(allUsers, "asUserAsOption"), [allUsers]);

  const filtered = useMemo(() => filter(veranstaltungen, applyTeamFilter(teamFilter)), [teamFilter, veranstaltungen]);

  const veranstaltungenNachMonat = useMemo(() => {
    if (filtered.length === 0) {
      return {};
    }
    const groups = groupBy(filtered, "startDatumUhrzeit.monatLangJahrKompakt");
    forEach(keys(groups), (group) => {
      groups[group] = sortBy(groups[group], "startDate");
    });
    return groups;
  }, [filtered]);

  const monate = useMemo(() => keys(veranstaltungenNachMonat), [veranstaltungenNachMonat]);

  return { period, usersAsOptions, veranstaltungenNachMonat, monate, veranstaltungen, filtered };
};
