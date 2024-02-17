import { useCallback, useMemo } from "react";
import Konzert, { ImageOverviewVeranstaltung } from "../../../../../shared/konzert/konzert.ts";
import uniq from "lodash/uniq";
import flatten from "lodash/flatten";
import intersection from "lodash/intersection";
import differenceBy from "lodash/differenceBy";
import { useQueries } from "@tanstack/react-query";
import { imagenames as imagenamesQuery, veranstaltungenForTeam } from "@/commons/loader.ts";

function suitableForImageOverview(veranstaltung: Konzert): ImageOverviewVeranstaltung {
  return {
    id: veranstaltung.id || "",
    startDate: veranstaltung.startDatumUhrzeit.tagMonatJahrKompakt,
    titel: veranstaltung.kopf.titel,
    url: veranstaltung.url ?? "",
    images: veranstaltung.presse.image,
  };
}

export function useCreateImagenamesSections() {
  const { imagenames, veranstaltungen } = useQueries({
    queries: [
      { queryKey: ["imagenames"], queryFn: imagenamesQuery },
      { queryKey: ["veranstaltungenAlle"], queryFn: () => veranstaltungenForTeam("alle") },
    ],
    combine: ([a, b]) => {
      if (a?.data && b?.data) {
        return { imagenames: a.data, veranstaltungen: b.data.map(suitableForImageOverview) };
      }
      return { imagenames: [], veranstaltungen: [] };
    },
  });

  const elementsWithImage = useCallback(
    (imageName: string): ImageOverviewVeranstaltung[] =>
      veranstaltungen.filter((each) => each.images.find((i) => i.localeCompare(imageName) === 0)),
    [veranstaltungen],
  );

  const toImageOverviewRow = useCallback(
    (im: string) => ({ image: im, newname: im, veranstaltungen: elementsWithImage(im) }),
    [elementsWithImage],
  );

  const result = useMemo(() => {
    function convertString(a: string): string {
      return a.replace(/\s/g, "_");
    }

    const imagenamesOfVeranstaltungen = uniq(flatten(veranstaltungen.map((each) => each.images))).sort();

    const imagesWithVeranstaltungen = intersection(imagenames, imagenamesOfVeranstaltungen).map(toImageOverviewRow);
    const imagesWithVeranstaltungenUnused = differenceBy(imagenames, imagenamesOfVeranstaltungen, convertString).map(toImageOverviewRow);
    const imagesWithVeranstaltungenNotFound = differenceBy(imagenamesOfVeranstaltungen, imagenames, convertString).map(toImageOverviewRow);
    return {
      with: imagesWithVeranstaltungen,
      notFound: imagesWithVeranstaltungenNotFound,
      unused: imagesWithVeranstaltungenUnused,
    };
  }, [imagenames, toImageOverviewRow, veranstaltungen]);

  return { ...result };
}
