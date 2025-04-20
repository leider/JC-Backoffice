import Collapsible from "@/widgets/Collapsible.tsx";
import { Col } from "antd";
import React, { useCallback, useMemo, useState } from "react";
import Konzert from "jc-shared/konzert/konzert.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import { saveKonzert } from "@/rest/loader.ts";
import TabKasse from "@/components/konzert/kasse/TabKasse.tsx";
import { KonzertContext } from "../KonzertContext";
import noop from "lodash/noop";
import { HelpWithKasseButton } from "@/components/colored/JazzButtons.tsx";
import JazzDrawerWithForm from "@/components/content/JazzDrawerWithForm.tsx";

function ButtonAbendkasse({ konzert, refetch }: { readonly konzert: Konzert; readonly refetch?: () => Promise<unknown> }) {
  const { currentUser } = useJazzContext();

  const mutateKonzert = useJazzMutation<Konzert>({
    saveFunction: saveKonzert,
    queryKey: "konzert",
    successMessage: "Das Konzert wurde gespeichert",
  });

  const saveForm = useCallback((konz: Konzert) => mutateKonzert.mutate(konz), [mutateKonzert]);

  const [isKasseHelpOpen, setIsKasseHelpOpen] = useState(false);

  const initialContext = useMemo(() => {
    return {
      isKasseHelpOpen,
      setKasseHelpOpen: setIsKasseHelpOpen,
      agenturauswahl: "",
      setAgenturauswahl: noop,
      hotelauswahl: "",
      setHotelauswahl: noop,
      hotelpreiseAlsDefault: false,
      setHotelpreiseAlsDefault: noop,
    };
  }, [isKasseHelpOpen]);

  const openKasseHelp = useCallback(() => setIsKasseHelpOpen(true), []);

  if (currentUser.id && !currentUser.accessrights.isAbendkasse) {
    return;
  }
  return (
    <KonzertContext.Provider value={initialContext}>
      <JazzDrawerWithForm<Konzert>
        additionalButtons={[<HelpWithKasseButton callback={openKasseHelp} key="helpKasse" />]}
        buttonText="Abendkasse"
        buttonType="kasse"
        data={konzert}
        resetChanges={refetch}
        saveForm={saveForm}
        title="Abendkasse bearbeiten"
      >
        <TabKasse />
      </JazzDrawerWithForm>
    </KonzertContext.Provider>
  );
}

export default function KasseInPreview({ konzert, refetch }: { readonly konzert: Konzert; readonly refetch?: () => Promise<unknown> }) {
  return (
    <Collapsible label="Eintritt und Abendkasse" suffix="kasse">
      <JazzRow>
        <Col span={24}>
          {konzert.eintrittspreise.frei ? (
            <p>Freier Eintritt (Sammelbox)</p>
          ) : (
            <JazzRow>
              <Col span={8}>
                <b>{konzert.eintrittspreise.regulaer},00 €</b>
              </Col>
              <Col span={8}>
                <b>{konzert.eintrittspreise.ermaessigt},00 €</b>
              </Col>
              <Col span={8}>
                <b>{konzert.eintrittspreise.mitglied},00 €</b>
              </Col>
            </JazzRow>
          )}
          <JazzRow>
            <Col offset={14} span={10}>
              <ButtonAbendkasse konzert={konzert} refetch={refetch} />
            </Col>
          </JazzRow>
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
