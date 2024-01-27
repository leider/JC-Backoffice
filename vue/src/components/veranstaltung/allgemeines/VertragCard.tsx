import React, { useContext, useMemo } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Button, Col, Form, Row, Select } from "antd";
import SingleSelect from "@/widgets/SingleSelect";
import Vertrag from "jc-shared/veranstaltung/vertrag";
import { DynamicItem } from "@/widgets/DynamicItem";
import { openVertrag } from "@/commons/loader.ts";
import Uploader from "@/components/veranstaltung/Uploader";
import { VeranstaltungContext } from "@/components/veranstaltung/VeranstaltungComp.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

export default function VertragCard() {
  const veranstContext = useContext(VeranstaltungContext);
  const form = veranstContext!.form;

  const { currentUser } = useJazzContext();

  const isBookingTeam = useMemo(() => currentUser.accessrights.isBookingTeam, [currentUser.accessrights.isBookingTeam]);

  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Vertrag">
      {veranstContext?.isDirty && <b>Vor dem generieren musst Du speichern!</b>}
      <Row gutter={12}>
        <Col span={9}>
          <SingleSelect name={["vertrag", "art"]} label="Art" options={Vertrag.arten()} />
        </Col>
        <Col span={9}>
          <Form.Item label={<b>Sprache:</b>} name={["vertrag", "sprache"]}>
            <Select options={Vertrag.sprachen().map((s) => ({ label: s, value: s }))} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <DynamicItem
            nameOfDepending={"id"}
            renderWidget={(getFieldValue) => {
              return (
                <Form.Item label="&nbsp;">
                  <Button
                    block
                    type="primary"
                    disabled={veranstContext?.isDirty || !isBookingTeam || !getFieldValue("id")}
                    onClick={() => openVertrag(form.getFieldsValue(true))}
                  >
                    Generieren
                  </Button>
                </Form.Item>
              );
            }}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={24}>
          <Uploader form={form} name={["vertrag", "datei"]} typ={"vertrag"} />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
