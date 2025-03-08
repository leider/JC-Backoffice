import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { konzertWithRiderForUrl, saveKonzert, saveOptionen, saveRider } from "@/commons/loader.ts";
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

  useEffect(() => {
    setMemoizedId(konzert?.id);
  }, [konzert?.id, setMemoizedId]);

  useEffect(() => {
    const accessrights = currentUser.accessrights;
    if (currentUser.id && !accessrights.isAbendkasse) {
      navigate(`/konzert/preview/${url}`);
    }
  }, [currentUser.accessrights, currentUser.id, navigate, url]);

  function saveForm(vals: KonzertWithRiderBoxes) {
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

    const untypedKonzert = vals as { agenturauswahl?: string; hotelauswahl?: string; hotelpreiseAlsDefault?: boolean };
    optionen.addOrUpdateKontakt("agenturen", konz.agentur, untypedKonzert.agenturauswahl ?? "");
    delete untypedKonzert.agenturauswahl;
    if (konz.artist.brauchtHotel) {
      optionen.addOrUpdateKontakt("hotels", konz.hotel, untypedKonzert.hotelauswahl ?? "");
      delete untypedKonzert.hotelauswahl;
      if (untypedKonzert.hotelpreiseAlsDefault) {
        optionen.updateHotelpreise(konz.hotel, konz.unterkunft.zimmerPreise);
        delete untypedKonzert.hotelpreiseAlsDefault;
      }
    }
    optionen.updateBackline("Jazzclub", konz.technik.backlineJazzclub);
    optionen.updateBackline("Rockshop", konz.technik.backlineRockshop);
    optionen.updateCollection("artists", konz.artist.name);
    mutateOptionen.mutate(optionen);
    mutateRider.mutate(new Rider({ id: url, startDate: konz.startDate, boxes: riderBoxes }));
    mutateKonzert.mutate(konz);
  }

  return (
    <KonzertContext.Provider value={{ isKasseHelpOpen, setKasseHelpOpen: setIsKasseHelpOpen }}>
      <KonzertFormAndPageHeader data={konzert} resetChanges={refetch} saveForm={saveForm}>
        <ShowOnCopy title="Kopiertes Konzert" />
        <KonzertTabs />
      </KonzertFormAndPageHeader>
    </KonzertContext.Provider>
  );
}
