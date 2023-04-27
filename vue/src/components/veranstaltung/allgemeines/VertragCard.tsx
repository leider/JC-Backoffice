import React, { useEffect, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Button, Col, Form, FormInstance, Row, Select } from "antd";
import "easymde/dist/easymde.min.css";
import SingleSelect from "@/widgets-react/SingleSelect";
import Vertrag from "jc-shared/veranstaltung/vertrag";
import { DynamicItem } from "@/widgets-react/DynamicItem";
import { useAuth } from "@/commons/auth";
import { openVertrag } from "@/commons/loader-for-react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";

export default function VertragCard(props: { form: FormInstance<Veranstaltung> }) {
  const { context } = useAuth();

  const [isBookingTeam, setIsBookingTeam] = useState<boolean>(false);
  useEffect(() => {
    setIsBookingTeam(!!context?.currentUser.accessrights?.isBookingTeam);
  }, [context]);

  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Vertrag">
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
                    disabled={!isBookingTeam || !getFieldValue("id")}
                    onClick={() => openVertrag(props.form.getFieldsValue(true))}
                  >
                    Generieren
                  </Button>
                </Form.Item>
              );
            }}
          />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
