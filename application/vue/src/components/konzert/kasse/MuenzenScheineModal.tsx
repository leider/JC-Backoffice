import { Col, Form, Input, theme } from "antd";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { NumberInput } from "@/widgets/numericInputWidgets";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import NumericInputEmbedded from "@/widgets/numericInputWidgets/NumericInputEmbedded.tsx";
import { useWatch } from "antd/es/form/Form";
import { KassenContext } from "@/components/konzert/kasse/KassenContext.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import map from "lodash/map";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import { JazzModal } from "@/widgets/JazzModal.tsx";
import KonzertWithRiderBoxes from "jc-shared/konzert/konzertWithRiderBoxes.ts";

const items = [
  { name: "10", val: "0,10" },
  { name: "20", val: "0,20" },
  { name: "50", val: "0,50" },
  { name: "100", val: "1,00" },
  { name: "200", val: "2,00" },
  { name: "500", val: "5,00" },
  { name: "1000", val: "10,00" },
  { name: "2000", val: "20,00" },
  { name: "5000", val: "50,00" },
  { name: "10000", val: "100,00" },
];

function ImmediateEuro({ isBeginn, name }: { readonly isBeginn: boolean; readonly name: string }) {
  const fullName = useMemo(() => ["kasse", isBeginn ? "startinhalt" : "endinhalt", name], [isBeginn, name]);
  return (
    <Form.Item name={fullName} valuePropName="number">
      <ImmediateEuroEmbedded name={name} />
    </Form.Item>
  );
}

function ImmediateEuroEmbedded({ name, number }: { readonly name: string; readonly number?: number }) {
  const value = useMemo(() => {
    return parseInt(name) * (number ?? 0) * 0.01;
  }, [name, number]);
  return <NumericInputEmbedded decimals={2} disabled number={value} suffix="€" />;
}

export function MuenzenScheineModal({ isBeginn }: { readonly isBeginn: boolean }) {
  const { color } = colorsAndIconsForSections;
  const { token } = theme.useToken();
  const form = useFormInstance<KonzertWithRiderBoxes>();
  const { isDirty } = useJazzContext();
  const { refStartinhalt, refEndinhalt } = useContext(KassenContext);
  const [openModal, setOpenModal] = useState(false);

  const freigabe = useWatch(["kasse", "kassenfreigabe"], { form, preserve: true });

  const sumForInhalt = useCallback(
    (startEnd: "startinhalt" | "endinhalt") => {
      const inhalt = form.getFieldValue(["kasse", startEnd]);
      return map(items, "name").reduce((prev, curr) => {
        return prev + (parseInt(curr, 10) * (inhalt[curr] ?? 0)) / 100;
      }, 0);
    },
    [form],
  );

  const updateBestandEUR = useCallback(() => {
    form.setFieldValue(
      ["kasse", isBeginn ? "anfangsbestandEUR" : "endbestandGezaehltEUR"],
      sumForInhalt(isBeginn ? "startinhalt" : "endinhalt"),
    );
  }, [form, isBeginn, sumForInhalt]);

  return (
    <>
      <JazzModal
        closable={false}
        footer={[
          isDirty && (
            <ButtonWithIcon
              color={token.colorSuccess}
              key="closeOnly"
              onClick={() => setOpenModal(false)}
              text="Schließen ohne Speichern"
              type="default"
            />
          ),
          <ButtonWithIcon
            color={token.colorSuccess}
            key="close"
            onClick={() => {
              isDirty && form.submit();
              setOpenModal(false);
            }}
            text={isDirty ? "Speichern & Schließen" : "Schließen"}
          />,
        ]}
        maskClosable={false}
        open={openModal}
        title={`Kasseninhalt ${isBeginn ? "zu Beginn" : "am Ende"}`}
      >
        {map(items, (item) => (
          <JazzRow key={item.name}>
            <Col span={8}>
              <Input disabled value={`${item.val} €`} variant="borderless" />
            </Col>
            <Col span={8}>
              <NumberInput
                decimals={0}
                disabled={!!freigabe}
                name={["kasse", isBeginn ? "startinhalt" : "endinhalt", item.name]}
                onChange={updateBestandEUR}
              />
            </Col>
            <Col span={8}>
              <ImmediateEuro isBeginn={isBeginn} name={item.name} />
            </Col>
          </JazzRow>
        ))}
        <JazzRow>
          <Col offset={16} span={8}>
            <NumberInput
              decimals={2}
              disabled
              label="Summe"
              name={["kasse", isBeginn ? "anfangsbestandEUR" : "endbestandGezaehltEUR"]}
              suffix="€"
            />
          </Col>
        </JazzRow>
      </JazzModal>
      <ButtonWithIcon
        alwaysText
        block
        color={color("kasse")}
        icon="CurrencyExchange"
        onClick={() => {
          setOpenModal(true);
        }}
        ref={isBeginn ? refStartinhalt : refEndinhalt}
        text={isBeginn ? "Startinhalt" : "Endinhalt"}
        tooltipTitle={isBeginn ? "Kasseninhalt zu Beginn" : "Kasseninhalt am Ende"}
      />
    </>
  );
}
