import React, { useContext, useEffect, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Row } from "antd";
import { VermietungContext } from "@/components/vermietung/VermietungComp.tsx";
import { NumberInput } from "@/widgets/numericInputWidgets";
import { DynamicItem } from "@/widgets/DynamicItem.tsx";
import { NumberInputWithDirectValue } from "@/widgets/numericInputWidgets/NumericInputs.tsx";
import Angebot from "jc-shared/vermietung/angebot.ts";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";

export default function AngebotCard() {
  const context = useContext(VermietungContext);
  const form = context!.form;

  const [summe, setSumme] = useState<number>(0);
  const [readonly, setReadonly] = useState<boolean>(false);
  useEffect(() => {
    setReadonly(false);
  }, []);

  function updateSumme() {
    const angebot = new Angebot(form.getFieldValue("angebot"));
    setSumme(angebot.summe);
  }

  const { lg } = useBreakpoint();

  return (
    <CollapsibleForVeranstaltung suffix="angebot" label="Posten" noTopBorder={lg} amount={summe}>
      <Row gutter={12}>
        <Col span={8}>
          <NumberInput
            name={["angebot", "saalmiete"]}
            label="Saalmiete"
            decimals={2}
            suffix={"€"}
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["angebot", "saalmieteRabatt"]}
            label="Rabatt (optional)"
            decimals={0}
            suffix={"%"}
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
        <Col span={8}>
          <DynamicItem
            nameOfDepending={["angebot", "saalmiete"]}
            renderWidget={(getFieldValue) => {
              return (
                <DynamicItem
                  nameOfDepending={["angebot", "saalmieteRabatt"]}
                  renderWidget={() => {
                    const angebot = new Angebot(getFieldValue("angebot"));
                    return <NumberInputWithDirectValue label="Total" value={angebot.saalmieteTotal} decimals={2} suffix="€" />;
                  }}
                />
              );
            }}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={8}>
          <NumberInput
            name={["angebot", "tontechnikerAnzahl"]}
            label="Tontechnik (Anzahl)"
            decimals={0}
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["angebot", "tontechnikerBetrag"]}
            label="Tontechnik (Einzelpreis)"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
        <Col span={8}>
          <DynamicItem
            nameOfDepending={["angebot", "tontechnikerAnzahl"]}
            renderWidget={(getFieldValue) => {
              return (
                <DynamicItem
                  nameOfDepending={["angebot", "tontechnikerBetrag"]}
                  renderWidget={() => {
                    const angebot = new Angebot(getFieldValue("angebot"));
                    return <NumberInputWithDirectValue label="Total" value={angebot.tontechnikerTotal} decimals={2} suffix="€" />;
                  }}
                />
              );
            }}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={8}>
          <NumberInput
            name={["angebot", "lichttechnikerAnzahl"]}
            label="Lichttechnik (Anzahl)"
            decimals={0}
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["angebot", "lichttechnikerBetrag"]}
            label="Lichttechnik (Einzelpreis)"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
        <Col span={8}>
          <DynamicItem
            nameOfDepending={["angebot", "lichttechnikerAnzahl"]}
            renderWidget={(getFieldValue) => {
              return (
                <DynamicItem
                  nameOfDepending={["angebot", "lichttechnikerBetrag"]}
                  renderWidget={() => {
                    const angebot = new Angebot(getFieldValue("angebot"));
                    return <NumberInputWithDirectValue label="Total" value={angebot.lichttechnikerTotal} decimals={2} suffix="€" />;
                  }}
                />
              );
            }}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={8}>
          <NumberInput
            name={["angebot", "musikerAnzahl"]}
            label="Musiker (Anzahl)"
            decimals={0}
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["angebot", "musikerGage"]}
            label="Musiker (Einzelpreis)"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
        <Col span={8}>
          <DynamicItem
            nameOfDepending={["angebot", "musikerAnzahl"]}
            renderWidget={(getFieldValue) => {
              return (
                <DynamicItem
                  nameOfDepending={["angebot", "musikerGage"]}
                  renderWidget={() => {
                    const angebot = new Angebot(getFieldValue("angebot"));
                    return <NumberInputWithDirectValue label="Total" value={angebot.musikerTotal} decimals={2} suffix="€" />;
                  }}
                />
              );
            }}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={8}>
          <NumberInput
            name={["angebot", "barpersonalAnzahl"]}
            label="Bar Personal (Anzahl)"
            decimals={0}
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["angebot", "barpersonalBetrag"]}
            label="Bar Personal (Einzelpreis)"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
        <Col span={8}>
          <DynamicItem
            nameOfDepending={["angebot", "barpersonalAnzahl"]}
            renderWidget={(getFieldValue) => {
              return (
                <DynamicItem
                  nameOfDepending={["angebot", "barpersonalBetrag"]}
                  renderWidget={() => {
                    const angebot = new Angebot(getFieldValue("angebot"));
                    return <NumberInputWithDirectValue label="Total" value={angebot.barpersonalTotal} decimals={2} suffix="€" />;
                  }}
                />
              );
            }}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={8}>
          <NumberInput
            name={["angebot", "fluegel"]}
            label="Flügel (Einzelpreis)"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["angebot", "reinigungHaus"]}
            label="Reinigung Haus"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["angebot", "reinigungBar"]}
            label="Reinigung Bar"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
