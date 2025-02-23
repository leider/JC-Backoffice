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
export function MuenzenScheineModal({ isBeginn }: { isBeginn: boolean }) {
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

  function ImmediateEuro({ name }: { name: string }) {
    const fullName = useMemo(() => ["kasse", isBeginn ? "startinhalt" : "endinhalt", name], [name]);
    return (
      <Form.Item name={fullName} valuePropName="number">
        <ImmediateEuroEmbedded name={name} />
      </Form.Item>
    );
  }

  function ImmediateEuroEmbedded({ name, number }: { name: string; number?: number }) {
    const value = useMemo(() => {
      return parseInt(name) * (number ?? 0) * 0.01;
    }, [name, number]);
    return <NumericInputEmbedded decimals={2} disabled suffix="€" number={value} />;
  }

  return (
    <>
      <JazzModal
        title={`Kasseninhalt ${isBeginn ? "zu Beginn" : "am Ende"}`}
        open={openModal}
        closable={false}
        maskClosable={false}
        footer={[
          isDirty && (
            <ButtonWithIcon
              text="Schließen ohne Speichern"
              type="default"
              key="closeOnly"
              onClick={() => setOpenModal(false)}
              color={token.colorSuccess}
            />
          ),
          <ButtonWithIcon
            text={isDirty ? "Speichern & Schließen" : "Schließen"}
            key="close"
            onClick={() => {
              isDirty && form.submit();
              setOpenModal(false);
            }}
            color={token.colorSuccess}
          />,
        ]}
      >
        {map(items, (item) => (
          <JazzRow key={item.name}>
            <Col span={8}>
              <Input disabled value={`${item.val} €`} variant="borderless" />
            </Col>
            <Col span={8}>
              <NumberInput
                name={["kasse", isBeginn ? "startinhalt" : "endinhalt", item.name]}
                decimals={0}
                disabled={!!freigabe}
                onChange={updateBestandEUR}
              />
            </Col>
            <Col span={8}>
              <ImmediateEuro name={item.name} />
            </Col>
          </JazzRow>
        ))}
        <JazzRow>
          <Col span={8} offset={16}>
            <NumberInput
              name={["kasse", isBeginn ? "anfangsbestandEUR" : "endbestandGezaehltEUR"]}
              label="Summe"
              decimals={2}
              suffix="€"
              disabled
            />
          </Col>
        </JazzRow>
      </JazzModal>
      <ButtonWithIcon
        ref={isBeginn ? refStartinhalt : refEndinhalt}
        block
        alwaysText
        text={isBeginn ? "Startinhalt" : "Endinhalt"}
        icon="CurrencyExchange"
        onClick={() => {
          setOpenModal(true);
        }}
        tooltipTitle={isBeginn ? "Kasseninhalt zu Beginn" : "Kasseninhalt am Ende"}
        color={color("kasse")}
      />
    </>
  );
}
