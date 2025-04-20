import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { konzertWithRiderForUrl, saveKonzert, saveOptionen, saveRider } from "@/rest/loader.ts";
import Konzert from "jc-shared/konzert/konzert.ts";
import KonzertTabs from "@/components/konzert/KonzertTabs";
import { Rider } from "jc-shared/rider/rider.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import { KonzertContext } from "./KonzertContext";
import { ShowOnCopy } from "@/components/veranstaltung/ShowOnCopy.tsx";
import KonzertFormAndPageHeader from "@/components/konzert/KonzertFormAndPageHeader.tsx";
import OptionValues from "jc-shared/optionen/optionValues.ts";
import KonzertWithRiderBoxes from "jc-shared/konzert/konzertWithRiderBoxes.ts";

export default function KonzertComp() {
  const { url } = useParams();
  const [isKasseHelpOpen, setIsKasseHelpOpen] = useState(false);
  const [agenturauswahl, setAgenturauswahl] = useState("[temporär]");
  const [hotelauswahl, setHotelauswahl] = useState("[temporär]");
  const [hotelpreiseAlsDefault, setHotelpreiseAlsDefault] = useState(false);

  const { data: konzert, refetch } = useQuery({ queryKey: ["konzert", url], queryFn: () => konzertWithRiderForUrl(url || "") });

  const mutateKonzert = useJazzMutation<Konzert>({
    saveFunction: saveKonzert,
    queryKey: "konzert",
    successMessage: "Das Konzert wurde gespeichert",
    forwardForNew: true,
  });
  const mutateOptionen = useJazzMutation<OptionValues>({ saveFunction: saveOptionen, queryKey: "optionen" });
  const mutateRider = useJazzMutation<Rider>({ saveFunction: saveRider, queryKey: "rider" });

  const { currentUser, optionen, setMemoizedId } = useJazzContext();
  const navigate = useNavigate();

  const reloadAndResetAuswahlen = useCallback(() => {
    setHotelauswahl("[temporär]");
    setAgenturauswahl("[temporär]");
    setHotelpreiseAlsDefault(false);
    return refetch();
  }, [refetch]);

  useEffect(() => {
    setMemoizedId(konzert?.id);
  }, [konzert?.id, setMemoizedId]);

  useEffect(() => {
    const accessrights = currentUser.accessrights;
    if (currentUser.id && !accessrights.isAbendkasse) {
      navigate(`/konzert/preview/${url}`);
    }
  }, [currentUser.accessrights, currentUser.id, navigate, url]);

  const saveForm = useCallback(
    (vals: KonzertWithRiderBoxes) => {
      const riderBoxes = vals.riderBoxes;
      const konz = new Konzert(vals);
      const id = konz?.id;
      if (!konz.id) {
        konz.initializeIdAndUrl();
      }
      if (!currentUser.accessrights.isOrgaTeam && id) {
        // prevent saving of optionen and rider for Kasse / Gäste updates
        return mutateKonzert.mutate(konz);
      }

      optionen.addOrUpdateKontakt("agenturen", konz.agentur, agenturauswahl);
      if (konz.artist.brauchtHotel) {
        optionen.addOrUpdateKontakt("hotels", konz.hotel, hotelauswahl);
        if (hotelpreiseAlsDefault) {
          optionen.updateHotelpreise(konz.hotel, konz.unterkunft.zimmerPreise);
        }
      }
      optionen.updateBackline("Jazzclub", konz.technik.backlineJazzclub);
      optionen.updateBackline("Rockshop", konz.technik.backlineRockshop);
      optionen.updateCollection("artists", konz.artist.name);
      mutateOptionen.mutate(optionen);
      mutateRider.mutate(new Rider({ id: url, startDate: konz.startDate, boxes: riderBoxes }));
      mutateKonzert.mutate(konz);
    },
    [
      currentUser.accessrights.isOrgaTeam,
      mutateKonzert,
      optionen,
      agenturauswahl,
      hotelauswahl,
      hotelpreiseAlsDefault,
      mutateOptionen,
      mutateRider,
      url,
    ],
  );

  const initialContext = useMemo(() => {
    return {
      isKasseHelpOpen,
      setKasseHelpOpen: setIsKasseHelpOpen,
      agenturauswahl,
      setAgenturauswahl,
      hotelauswahl,
      setHotelauswahl,
      hotelpreiseAlsDefault,
      setHotelpreiseAlsDefault,
    };
  }, [agenturauswahl, hotelauswahl, hotelpreiseAlsDefault, isKasseHelpOpen]);

  return (
    <KonzertContext.Provider value={initialContext}>
      <KonzertFormAndPageHeader data={konzert} resetChanges={reloadAndResetAuswahlen} saveForm={saveForm}>
        <ShowOnCopy title="Kopiertes Konzert" />
        <KonzertTabs />
      </KonzertFormAndPageHeader>
    </KonzertContext.Provider>
  );
}
