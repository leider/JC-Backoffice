import React from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Row } from "antd";
import { TextField } from "@/widgets/TextField";
import StartEndPickers from "@/widgets/StartEndPickers";
import { NumberInput } from "@/widgets/numericInputWidgets";
import CheckItem from "@/widgets/CheckItem";
import { DynamicItem } from "@/widgets/DynamicItem.tsx";

export default function EventCard() {
  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Event" noTopBorder>
      <Row gutter={12}>
        <Col span={8}>
          <CheckItem label="Ist bestätigt" name={["kopf", "confirmed"]} />
          <CheckItem label="Braucht Technik" name="brauchtTechnik" />
          <CheckItem label="Braucht Presse" name="brauchtPresse" />
        </Col>
        <Col span={8}>
          <DynamicItem
            nameOfDepending="brauchtTechnik"
            renderWidget={(getFieldValue) =>
              getFieldValue("brauchtTechnik") && (
                <>
                  <CheckItem label="Technik ist geklärt" name={["technik", "checked"]} />
                  <CheckItem label="Flügel stimmen" name={["technik", "fluegel"]} />
                </>
              )
            }
          />
          <DynamicItem
            nameOfDepending="brauchtPresse"
            renderWidget={(getFieldValue) =>
              getFieldValue("brauchtPresse") && (
                <>
                  <CheckItem label="Presse OK" name={["presse", "checked"]} />
                  <CheckItem label="Fotograf einladen" name={["kopf", "fotografBestellen"]} />
                </>
              )
            }
          />
        </Col>
        <Col span={8}>
          <CheckItem label="Kann Homepage" name={["kopf", "kannAufHomePage"]} />
          <CheckItem label="Kann Social Media" name={["kopf", "kannInSocialMedia"]} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={16}>
          <TextField name={["kopf", "titel"]} label="Titel" required />
        </Col>
        <Col span={8}>
          <NumberInput name={["saalmiete"]} label="Saalmiete" decimals={2} suffix="€" required />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={24}>
          <StartEndPickers />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
