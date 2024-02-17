import React, { useContext, useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Button, Col, ConfigProvider, Form, Row, theme } from "antd";
import TextArea from "antd/es/input/TextArea";
import { NumberInput } from "@/widgets/numericInputWidgets";
import { fromFormObject } from "@/components/konzert/konzertCompUtils";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import CheckItem from "@/widgets/CheckItem";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { KonzertContext } from "@/components/konzert/KonzertComp";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

export default function TransportCard() {
  const konzertContext = useContext(KonzertContext);
  const form = konzertContext!.form;

  const [summe, setSumme] = useState<number>(0);

  useEffect(
    () => {
      updateSumme();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [form],
  );
  function updateSumme() {
    const konzert = fromFormObject(form);
    setSumme(konzert.unterkunft.transportEUR);
  }
  const { currentUser } = useJazzContext();
  const sendMail = () => {
    const konzert = fromFormObject(form);
    const unterkunft = konzert.unterkunft;
    const email = encodeURIComponent(`${konzert.hotel.name}<${konzert.hotel.email}>`);
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
${currentUser.name}`);

    window.location.href = "mailto:" + email + "?subject=" + subject + "&body=" + text;
  };

  const { lg } = useBreakpoint();
  const { useToken } = theme;
  const token = useToken().token;

  return (
    <>
      <Collapsible suffix="hotel" label="Transport" amount={summe} noTopBorder={lg}>
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
      </Collapsible>
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
          <ConfigProvider theme={{ token: { colorPrimary: token.colorSuccess } }}>
            <Button block icon={<IconForSmallBlock iconName={"EnvelopeOpen"} />} type="primary" onClick={sendMail}>
              &nbsp;Reservierungsmail
            </Button>
          </ConfigProvider>
        </Col>
      </Row>
    </>
  );
}
