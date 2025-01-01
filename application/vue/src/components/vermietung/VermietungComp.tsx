import * as React from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { saveVermietung, vermietungForUrl } from "@/commons/loader.ts";
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

  const { currentUser } = useJazzContext();
  const navigate = useNavigate();

  useEffect(() => {
    const accessrights = currentUser.accessrights;
    if (currentUser.id && !accessrights.isOrgaTeam) {
      navigate(`/team`);
    }
  }, [currentUser, navigate]);

  function saveForm(vals: Vermietung) {
    const vermiet = new Vermietung(vals);
    if (!vermiet.id) {
      vermiet.initializeIdAndUrl();
    }
    mutateVermietung.mutate(vermiet);
  }

  return (
    <VermietungFormAndPageHeader data={data} saveForm={saveForm} resetChanges={refetch}>
      <ShowOnCopy title={"Kopierte Vermietung"} />
      <VermietungTabs />
    </VermietungFormAndPageHeader>
  );
}
