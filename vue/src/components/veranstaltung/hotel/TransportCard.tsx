import React, { useContext, useEffect, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Button, Col, ConfigProvider, Form, Row } from "antd";
import TextArea from "antd/es/input/TextArea";
import { NumberInput } from "@/widgets/numericInputWidgets";
import { fromFormObject } from "@/components/veranstaltung/veranstaltungCompUtils";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import CheckItem from "@/widgets/CheckItem";
import { IconForSmallBlock } from "@/components/Icon";
import { useAuth } from "@/commons/auth";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { VeranstaltungContext } from "@/components/veranstaltung/VeranstaltungComp.tsx";

export default function TransportCard() {
  const veranstContext = useContext(VeranstaltungContext);
  const form = veranstContext!.form;

  const [summe, setSumme] = useState<number>(0);

  useEffect(() => {
    updateSumme();
  }, [form]);
  function updateSumme() {
    const veranstaltung = fromFormObject(form);
    setSumme(veranstaltung.unterkunft.transportEUR);
  }
  const { context } = useAuth();
  const sendMail = () => {
    const veranstaltung = fromFormObject(form);
    const unterkunft = veranstaltung.unterkunft;
    const email = encodeURIComponent(`${veranstaltung.hotel.name}<${veranstaltung.hotel.email}>`);
    const subject = encodeURIComponent(`Jazzclub Reservierungsanfrage für ${unterkunft.anreiseDisplayDate}`);
    const einzel = unterkunft.einzelNum;
    const einzelText = einzel > 0 ? `${einzel} Einzelzimmer, ` : "";
    const doppel = unterkunft.doppelNum;
    const doppelText = doppel > 0 ? `${doppel} Doppelzimmer, ` : "";
    const suite = unterkunft.suiteNum;
    const suiteText = suite > 0 ? `${suite} Suite(n), ` : "";

    const text = encodeURIComponent(`Sehr geehrte Damen und Herren,

bitte reservieren Sie für den Jazzclub Karlsruhe e.V.:
${einzelText}${doppelText}${suiteText} für ${unterkunft.anzNacht}.
Anreise: ${unterkunft.anreiseDisplayDate}, Abreise: ${unterkunft.abreiseDisplayDate}

Die Namen der Gäste lauten:
${unterkunft.kommentar}

Mit freundlichen Grüßen,
${context?.currentUser.name}`);

    window.location.href = "mailto:" + email + "?subject=" + subject + "&body=" + text;
  };

  const { lg } = useBreakpoint();
  return (
    <>
      <CollapsibleForVeranstaltung suffix="hotel" label="Transport" amount={summe} noTopBorder={lg}>
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item label={<b>Anmerkungen:</b>} name={["unterkunft", "kommentar"]}>
              <TextArea rows={7} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <MultiSelectWithTags
              name={["unterkunft", "sonstiges"]}
              label="Bus / Sonstiges"
              options={["Parkgenehmigung", "Stromanschluss"]}
              noAdd
            />
          </Col>
          <Col span={12}>
            <NumberInput name={["unterkunft", "transportEUR"]} label="Summe" decimals={2} suffix={"€"} onChange={updateSumme} />
          </Col>
        </Row>
      </CollapsibleForVeranstaltung>
      <Row gutter={12}>
        <Col span={12}>
          <CheckItem name={["unterkunft", "angefragt"]} label="Hotel Angefragt" />
        </Col>
        <Col span={12}>
          <CheckItem name={["unterkunft", "bestaetigt"]} label="Hotel Bestätigt" />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={12}>
          <ConfigProvider theme={{ token: { colorPrimary: "#28a745" } }}>
            <Button block icon={<IconForSmallBlock iconName={"EnvelopeOpen"} />} type="primary" onClick={sendMail}>
              &nbsp;Reservierungsmail
            </Button>
          </ConfigProvider>
        </Col>
      </Row>
    </>
  );
}
