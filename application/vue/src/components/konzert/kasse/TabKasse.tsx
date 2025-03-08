import { Col, Tour, TourProps } from "antd";
import React, { Ref, useContext, useMemo, useRef } from "react";
import EinnahmenCard from "@/components/konzert/kasse/EinnahmenCard";
import AusgabenCard from "@/components/konzert/kasse/AusgabenCard";
import { KassenzettelFreigabe } from "@/components/konzert/kasse/KassenzettelFreigabe";
import { NumberInput } from "@/widgets/numericInputWidgets";
import Kasse from "jc-shared/konzert/kasse";
import { useWatch } from "antd/es/form/Form";
import { KonzertContext } from "@/components/konzert/KonzertContext.ts";
import { KassenContext } from "./KassenContext";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { JazzRow } from "@/widgets/JazzRow";
import { NumberInputWithDirectValue } from "@/widgets/numericInputWidgets/NumericInputs.tsx";

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function TabKasse() {
  const form = useFormInstance();
  const { isKasseHelpOpen, setKasseHelpOpen } = useContext(KonzertContext);
  const kasseRaw = useWatch("kasse", { form, preserve: false });

  const refStartinhalt: Ref<HTMLButtonElement> = useRef(null);
  const refEndinhalt: Ref<HTMLButtonElement> = useRef(null);
  const refAusgaben: Ref<HTMLDivElement> = useRef(null);
  const refEinnahmen: Ref<HTMLDivElement> = useRef(null);
  const refAnBank: Ref<HTMLButtonElement> = useRef(null);

  const endbestandEUR = useMemo(() => new Kasse(kasseRaw).endbestandEUR, [kasseRaw]);

  const toursteps: TourProps["steps"] = [
    {
      title: "Vor Beginn: Startinhalt der Kasse ausfüllen",
      description: "Klicken, um den Anfangsbestand zu zählen.",
      target: refStartinhalt.current ? () => refStartinhalt.current! : undefined,
    },
    {
      title: "Nach Ende: Fülle die Ausgaben- und Einnahmensektion",
      description: "Speziell Catering oder andere Barentnahmen. Speichern nicht vergessen!",
      target: refAusgaben.current ? () => refAusgaben.current! : undefined,
    },
    {
      title: "Nach Ende: Endinhalt der Kasse ausfüllen",
      description: "Klicken, um den Endbestand zu zählen.",
      target: refEndinhalt.current ? () => refEndinhalt.current! : undefined,
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
      target: refAnBank.current ? () => refAnBank.current! : undefined,
    },
    {
      title: "Gezählten Endbestand korrigieren",
      description: 'Das, was "an Bank" geht, musst Du aus der Kasse entnehmen und den Endbestand anpassen.',
      target: refEndinhalt.current ? () => refEndinhalt.current! : undefined,
    },
  ];

  const initialContext = useMemo(() => {
    return { refStartinhalt, refEndinhalt, refAusgaben, refEinnahmen, refAnBank };
  }, []);

  return (
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
      <Tour onClose={() => setKasseHelpOpen(false)} open={isKasseHelpOpen} steps={toursteps} />
    </KassenContext.Provider>
  );
}
