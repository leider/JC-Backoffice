import { Button, Col, ConfigProvider, Form, Input, Modal, theme } from "antd";
import React, { useContext, useMemo, useState } from "react";
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
  const form = useFormInstance();
  const { isDirty } = useJazzContext();
  const { refStartinhalt, refEndinhalt } = useContext(KassenContext);
  const [openModal, setOpenModal] = useState(false);

  const freigabe = useWatch(["kasse", "kassenfreigabe"], { form, preserve: true });

  function sumForInhalt(startEnd: "startinhalt" | "endinhalt") {
    const inhalt = form.getFieldValue(["kasse", startEnd]);
    return map(items, "name").reduce((prev, curr) => {
      return prev + (parseInt(curr, 10) * (inhalt[curr] ?? 0)) / 100;
    }, 0);
  }

  function updateAnfangsbestandEUR() {
    form.setFieldValue(["kasse", "anfangsbestandEUR"], sumForInhalt("startinhalt"));
  }

  function updateEndbestandGezaehltEUR() {
    form.setFieldValue(["kasse", "endbestandGezaehltEUR"], sumForInhalt("endinhalt"));
  }

  function ImmediateEuro({ name }: { name: string }) {
    const fullName = ["kasse", isBeginn ? "startinhalt" : "endinhalt", name];
    return (
      <Form.Item name={fullName} valuePropName="number" trigger="onNumber">
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
      <Modal
        title={`Kasseninhalt ${isBeginn ? "zu Beginn" : "am Ende"}`}
        open={openModal}
        closable={false}
        maskClosable={false}
        footer={[
          <ConfigProvider key="dummykey" theme={{ token: { colorPrimary: token.colorSuccess } }}>
            <Button
              key="back"
              type="primary"
              onClick={() => {
                isBeginn ? updateAnfangsbestandEUR() : updateEndbestandGezaehltEUR();
                isDirty ? form.submit() : undefined;
                setOpenModal(false);
              }}
            >
              Speichern & Schließen
            </Button>
          </ConfigProvider>,
        ]}
      >
        {map(items, (item) => (
          <JazzRow key={item.name}>
            <Col span={8}>
              <Input disabled value={`${item.val} €`} variant="borderless" />
            </Col>
            <Col span={8}>
              <NumberInput name={["kasse", isBeginn ? "startinhalt" : "endinhalt", item.name]} decimals={0} disabled={!!freigabe} />
            </Col>
            <Col span={8}>
              <ImmediateEuro name={item.name} />
            </Col>
          </JazzRow>
        ))}
      </Modal>
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
