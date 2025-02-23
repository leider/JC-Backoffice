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

export default function TabKasse() {
  const form = useFormInstance();
  const { isKasseHelpOpen, setKasseHelpOpen } = useContext(KonzertContext);
  const kasseRaw = useWatch("kasse", { form, preserve: false });

  const refStartinhalt: Ref<HTMLElement> = useRef(null);
  const refEndinhalt: Ref<HTMLElement> = useRef(null);
  const refAusgaben: Ref<HTMLDivElement> = useRef(null);
  const refEinnahmen: Ref<HTMLDivElement> = useRef(null);
  const refAnBank: Ref<HTMLElement> = useRef(null);

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
  return (
    <KassenContext.Provider value={{ refStartinhalt, refEndinhalt, refAusgaben, refEinnahmen, refAnBank }}>
      <JazzRow>
        <Col xs={24} lg={12}>
          <EinnahmenCard />
          <KassenzettelFreigabe />
          <JazzRow>
            <Col span={8}>
              <NumberInput name={["kasse", "anfangsbestandEUR"]} label="Anfangsbestand Kasse" decimals={2} suffix="€" disabled />
            </Col>
            <Col span={8}>
              <NumberInput disabled name={["kasse", "endbestandGezaehltEUR"]} label="Endbestand Gezählt" decimals={2} suffix="€" />
            </Col>
            <Col span={8}>
              <NumberInputWithDirectValue label="Endbestand Berechnet" value={endbestandEUR} suffix="€" decimals={2} />
            </Col>
          </JazzRow>
        </Col>
        <Col xs={24} lg={12}>
          <AusgabenCard />
        </Col>
      </JazzRow>
      <Tour steps={toursteps} open={isKasseHelpOpen} onClose={() => setKasseHelpOpen(false)} />
    </KassenContext.Provider>
  );
}
