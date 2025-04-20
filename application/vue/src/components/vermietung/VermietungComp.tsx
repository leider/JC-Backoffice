import * as React from "react";
import { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { saveVermietung, vermietungForUrl } from "@/rest/loader.ts";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import VermietungTabs from "@/components/vermietung/VermietungTabs.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import { ShowOnCopy } from "@/components/veranstaltung/ShowOnCopy.tsx";
import VermietungFormAndPageHeader from "@/components/vermietung/VermietungFormAndPageHeader.tsx";

export default function VermietungComp() {
  const { url } = useParams();

  const { data, refetch } = useQuery({
    queryKey: ["vermietung", url],
    queryFn: () => vermietungForUrl(url ?? ""),
  });

  const mutateVermietung = useJazzMutation<Vermietung>({
    saveFunction: saveVermietung,
    queryKey: "vermietung",
    successMessage: "Die Vermietung wurde gespeichert",
    forwardForNew: true,
  });

  const { currentUser, setMemoizedId } = useJazzContext();
  const navigate = useNavigate();

  useEffect(() => {
    setMemoizedId(data?.id);
  }, [data?.id, setMemoizedId]);

  useEffect(() => {
    const accessrights = currentUser.accessrights;
    if (currentUser.id && !accessrights.isOrgaTeam) {
      navigate(`/team`);
    }
  }, [currentUser, navigate]);

  const saveForm = useCallback(
    (vals: Vermietung) => {
      const vermiet = new Vermietung(vals);
      if (!vermiet.id) {
        vermiet.initializeIdAndUrl();
      }
      mutateVermietung.mutate(vermiet);
    },
    [mutateVermietung],
  );

  return (
    <VermietungFormAndPageHeader data={data} resetChanges={refetch} saveForm={saveForm}>
      <ShowOnCopy title="Kopierte Vermietung" />
      <VermietungTabs />
    </VermietungFormAndPageHeader>
  );
}
