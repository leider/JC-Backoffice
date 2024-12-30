import * as React from "react";
import { useEffect, useState } from "react";
import { Form } from "antd";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { konzertForUrl, riderFor, saveKonzert, saveOptionen, saveRider } from "@/commons/loader.ts";
import Konzert from "jc-shared/konzert/konzert.ts";
import KonzertTabs from "@/components/konzert/KonzertTabs";
import { BoxParams, Rider } from "jc-shared/rider/rider.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import { KonzertContext } from "./KonzertContext";
import { ShowOnCopy } from "@/components/veranstaltung/ShowOnCopy.tsx";
import KonzertFormAndPageHeader from "@/components/konzert/KonzertFormAndPageHeader.tsx";
import { useWatch } from "antd/es/form/Form";

export default function KonzertComp() {
  const { url } = useParams();
  const [form] = Form.useForm<Konzert & { riderBoxes?: BoxParams[] }>();
  const [isKasseHelpOpen, setIsKasseHelpOpen] = useState(false);

  const { konzert, refetch } = useQueries({
    queries: [
      { queryKey: ["konzert", url], queryFn: () => konzertForUrl(url || "") },
      { queryKey: ["rider", "url"], queryFn: () => riderFor(url || "") },
    ],
    combine: ([konzertQuery, riderQuery]) => {
      if (konzertQuery.data && riderQuery.data) {
        const konz = konzertQuery.data as Konzert & { riderBoxes: BoxParams[] };
        konz.riderBoxes = riderQuery.data.boxes;
        return { konzert: konz, refetch: konzertQuery.refetch };
      } else {
        return { konzert: new Konzert(), refetch: konzertQuery.refetch };
      }
    },
  });

  const queryClient = useQueryClient();

  const mutateKonzert = useJazzMutation<Konzert>({
    saveFunction: saveKonzert,
    queryKey: "konzert",
    successMessage: "Das Konzert wurde gespeichert",
  });

  const mutateOptionen = useMutation({
    mutationFn: saveOptionen,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["optionen"] }),
  });

  const mutateRider = useMutation({
    mutationFn: saveRider,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rider", url] }),
  });
  const id = useWatch("id", { form, preserve: true });

  const { currentUser, optionen } = useJazzContext();
  const navigate = useNavigate();

  useEffect(() => {
    const accessrights = currentUser.accessrights;
    if (currentUser.id && !accessrights.isAbendkasse) {
      navigate(`/konzert/preview/${url}`);
    }
  }, [currentUser.accessrights, currentUser.id, navigate, url]);

  function saveForm(vals: Konzert) {
    const konzert = new Konzert(vals);
    if (!id) {
      konzert.initializeIdAndUrl();
    }
    if (!currentUser.accessrights.isOrgaTeam && id) {
      // prevent saving of optionen for Kasse updates
      return mutateKonzert.mutate(konzert);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const untypedKonzert = konzert as any;
    optionen.addOrUpdateKontakt("agenturen", konzert.agentur, untypedKonzert.agenturauswahl);
    delete untypedKonzert.agenturauswahl;
    if (konzert.artist.brauchtHotel) {
      optionen.addOrUpdateKontakt("hotels", konzert.hotel, untypedKonzert.hotelauswahl);
      delete untypedKonzert.hotelauswahl;
      if (untypedKonzert.hotelpreiseAlsDefault) {
        optionen.updateHotelpreise(konzert.hotel, konzert.unterkunft.zimmerPreise);
        delete untypedKonzert.hotelpreiseAlsDefault;
      }
    }
    optionen.updateBackline("Jazzclub", konzert.technik.backlineJazzclub);
    optionen.updateBackline("Rockshop", konzert.technik.backlineRockshop);
    optionen.updateCollection("artists", konzert.artist.name);
    mutateOptionen.mutate(optionen);
    const boxes = form.getFieldValue("riderBoxes");
    const newrider = new Rider({ id: url, startDate: konzert.startDate, boxes });
    mutateRider.mutate(newrider);
    mutateKonzert.mutate(konzert);
  }

  return (
    <KonzertContext.Provider value={{ isKasseHelpOpen, setKasseHelpOpen: setIsKasseHelpOpen }}>
      <KonzertFormAndPageHeader data={konzert} saveForm={saveForm} resetChanges={refetch}>
        <ShowOnCopy title={"Kopiertes Konzert"} />
        <KonzertTabs />
      </KonzertFormAndPageHeader>
    </KonzertContext.Provider>
  );
}
