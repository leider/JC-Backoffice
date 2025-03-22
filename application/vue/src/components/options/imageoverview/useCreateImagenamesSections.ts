import { useCallback, useMemo } from "react";
import Konzert, { ImageOverviewRow, ImageOverviewVeranstaltung } from "jc-shared/konzert/konzert.ts";
import uniq from "lodash/uniq";
import flatMap from "lodash/flatMap";
import intersection from "lodash/intersection";
import differenceBy from "lodash/differenceBy";
import { useQueries } from "@tanstack/react-query";
import { imagenames as imagenamesQuery, konzerteForTeam } from "@/rest/loader.ts";
import map from "lodash/map";
import filter from "lodash/filter";
import sortBy from "lodash/sortBy";

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
      { queryKey: ["konzert", "alle"], queryFn: () => konzerteForTeam("alle") },
    ],
    combine: ([a, b]) => {
      if (a?.data && b?.data) {
        return { imagenames: a.data, veranstaltungen: map(b.data, suitableForImageOverview) };
      }
      return { imagenames: [], veranstaltungen: [] };
    },
  });

  const elementsWithImage = useCallback(
    (imageName: string): ImageOverviewVeranstaltung[] => filter(veranstaltungen, (veran) => veran.images.includes(imageName)),
    [veranstaltungen],
  );

  const toImageOverviewRow = useCallback(
    (im: string) => ({ image: im, newname: im, veranstaltungen: elementsWithImage(im) }) as ImageOverviewRow,
    [elementsWithImage],
  );

  return useMemo(() => {
    const convertString = (a: string): string => a.replace(/\s/g, "_");

    const imagenamesOfVeranstaltungen = sortBy(uniq(flatMap(veranstaltungen, "images") as string[]));

    return {
      with: map(intersection(imagenames, imagenamesOfVeranstaltungen), toImageOverviewRow),
      notFound: map(differenceBy(imagenamesOfVeranstaltungen, imagenames, convertString), toImageOverviewRow),
      unused: map(differenceBy(imagenames, imagenamesOfVeranstaltungen, convertString), toImageOverviewRow),
    };
  }, [imagenames, toImageOverviewRow, veranstaltungen]);
}
