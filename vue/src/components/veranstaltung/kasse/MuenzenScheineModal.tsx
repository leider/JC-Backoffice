import { Button, Col, Form, Input, Modal, Row } from "antd";
import React, { useContext, useMemo, useState } from "react";
import { NumberInput } from "@/widgets/numericInputWidgets";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { VeranstaltungContext } from "@/components/veranstaltung/VeranstaltungComp.tsx";
import NumericInputEmbedded from "@/widgets/numericInputWidgets/NumericInputEmbedded.tsx";

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
  const veranstContext = useContext(VeranstaltungContext);
  const form = veranstContext!.form;
  const [openModal, setOpenModal] = useState(false);

  const freigabe = Form.useWatch(["kasse", "kassenfreigabe"], { form, preserve: true });
  function updateAnfangsbestandEUR() {
    const startinhalt = form.getFieldValue(["kasse", "startinhalt"]);
    const sum = items
      .map((item) => item.name)
      .reduce((prev, curr) => {
        return prev + (parseInt(curr, 10) * (startinhalt[curr] ?? 0)) / 100;
      }, 0);
    form.setFieldValue(["kasse", "anfangsbestandEUR"], sum);
  }

  function updateEndbestandGezaehltEUR() {
    const endinhalt = form.getFieldValue(["kasse", "endinhalt"]);
    const sum = items
      .map((item) => item.name)
      .reduce((prev, curr) => {
        return prev + (parseInt(curr, 10) * (endinhalt[curr] ?? 0)) / 100;
      }, 0);
    form.setFieldValue(["kasse", "endbestandGezaehltEUR"], sum);
  }

  function ImmediateEuro({ name }: { name: string }) {
    const fullName = ["kasse", isBeginn ? "startinhalt" : "endinhalt", name];
    return (
      <Form.Item name={fullName} valuePropName="number" trigger="onNumber" style={{ marginBottom: 12 }}>
        <ImmediateEuroEmbedded name={name} />
      </Form.Item>
    );
  }

  function ImmediateEuroEmbedded({ name, number }: { name: string; number?: number }) {
    const value = useMemo(() => {
      return parseInt(name) * (number ?? 0) * 0.01;
    }, [name, number]);
    return <NumericInputEmbedded decimals={2} disabled={true} suffix="€" number={value} />;
  }

  return (
    <>
      <Modal
        title={`Kasseninhalt ${isBeginn ? "zu Beginn" : "am Ende"}`}
        open={openModal}
        closable={false}
        maskClosable={false}
        footer={[
          <Button
            key="back"
            type="primary"
            onClick={() => {
              isBeginn ? updateAnfangsbestandEUR() : updateEndbestandGezaehltEUR();
              setOpenModal(false);
            }}
          >
            Schließen
          </Button>,
        ]}
      >
        {items.map((item) => (
          <Row key={item.name} gutter={0}>
            <Col span={8}>
              <Input disabled value={`${item.val} €`} variant="borderless" />
            </Col>
            <Col span={8}>
              <NumberInput name={["kasse", isBeginn ? "startinhalt" : "endinhalt", item.name]} decimals={0} disabled={!!freigabe} />
            </Col>
            <Col span={8}>
              <ImmediateEuro name={item.name} />
            </Col>
          </Row>
        ))}
      </Modal>
      <ButtonWithIcon
        block
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
