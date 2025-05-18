import { Col, Tour, TourProps } from "antd";
import React, { Ref, useCallback, useContext, useMemo, useRef } from "react";
import EinnahmenCard from "@/components/konzert/kasse/EinnahmenCard";
import AusgabenCard from "@/components/konzert/kasse/AusgabenCard";
import { KassenzettelFreigabe } from "@/components/konzert/kasse/KassenzettelFreigabe";
import { NumberInput } from "@/widgets/numericInputWidgets";
import { KonzertContext } from "@/components/konzert/KonzertContext.ts";
import { KassenContext } from "./KassenContext";
import { JazzRow } from "@/widgets/JazzRow";
import useKassenSaldierer from "@/components/konzert/kasse/useKassenSaldierer.ts";
import { NumberInputWithDirectValue } from "@/widgets/numericInputWidgets/NumericInputs.tsx";
import ScrollingContent from "@/components/content/ScrollingContent.tsx";

function refTarget(refCurrent: HTMLButtonElement | HTMLDivElement | null) {
  return refCurrent ? () => refCurrent! : undefined;
}

function useInitialKasseContext() {
  const refStartinhalt: Ref<HTMLButtonElement> = useRef(null);
  const refEndinhalt: Ref<HTMLButtonElement> = useRef(null);
  const refAusgaben: Ref<HTMLDivElement> = useRef(null);
  const refEinnahmen: Ref<HTMLDivElement> = useRef(null);
  const refAnBank: Ref<HTMLButtonElement> = useRef(null);

  const toursteps: TourProps["steps"] = [
    {
      title: "Vor Beginn: Startinhalt der Kasse ausfüllen",
      description: "Klicken, um den Anfangsbestand zu zählen.",
      target: refTarget(refStartinhalt.current),
    },
    {
      title: "Nach Ende: Fülle die Ausgaben- und Einnahmensektion",
      description: "Speziell Catering oder andere Barentnahmen. Speichern nicht vergessen!",
      target: refTarget(refAusgaben.current),
    },
    {
      title: "Nach Ende: Endinhalt der Kasse ausfüllen",
      description: "Klicken, um den Endbestand zu zählen.",
      target: refTarget(refEndinhalt.current),
    },
    {
      title: "Eintritt der Kasse ausfüllen",
      description:
        "Fülle die Einnahmen aus Karte. Speichern nicht vergessen! Der Eintritt kann berechnet werden, wenn die anderen Felder gefüllt sind.",
      target: refEinnahmen.current ? () => refEinnahmen.current! : undefined,
    },
    {
      title: "Ausgabe an Bank ausfüllen",
      description:
        "Fülle die den Wert für an Bank. Speichern nicht vergessen! An Bank kann berechnet werden, wenn die anderen Felder gefüllt sind.",
      target: refTarget(refAnBank.current),
    },
    {
      title: "Gezählten Endbestand korrigieren",
      description: 'Das, was "an Bank" geht, musst Du aus der Kasse entnehmen und den Endbestand anpassen.',
      target: refTarget(refEndinhalt.current),
    },
  ];

  const initialContext = useMemo(() => {
    return { refStartinhalt, refEndinhalt, refAusgaben, refEinnahmen, refAnBank };
  }, []);

  return { toursteps, initialContext };
}

export default function TabKasse() {
  const { isKasseHelpOpen, setKasseHelpOpen } = useContext(KonzertContext);

  const { endbestandEUR } = useKassenSaldierer();

  const { toursteps, initialContext } = useInitialKasseContext();

  const closeHelp = useCallback(() => setKasseHelpOpen(false), [setKasseHelpOpen]);

  return (
    <ScrollingContent>
      <KassenContext.Provider value={initialContext}>
        <JazzRow>
          <Col lg={12} xs={24}>
            <EinnahmenCard />
            <KassenzettelFreigabe />
            <JazzRow>
              <Col span={8}>
                <NumberInput decimals={2} disabled label="Anfangsbestand Kasse" name={["kasse", "anfangsbestandEUR"]} suffix="€" />
              </Col>
              <Col span={8}>
                <NumberInput decimals={2} disabled label="Endbestand Gezählt" name={["kasse", "endbestandGezaehltEUR"]} suffix="€" />
              </Col>
              <Col span={8}>
                <NumberInputWithDirectValue decimals={2} label="Endbestand Berechnet" suffix="€" value={endbestandEUR} />
              </Col>
            </JazzRow>
          </Col>
          <Col lg={12} xs={24}>
            <AusgabenCard />
          </Col>
        </JazzRow>
        <Tour onClose={closeHelp} open={isKasseHelpOpen} steps={toursteps} />
      </KassenContext.Provider>
    </ScrollingContent>
  );
}
