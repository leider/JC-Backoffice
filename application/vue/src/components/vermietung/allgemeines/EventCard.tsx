import React from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col } from "antd";
import { TextField } from "@/widgets/TextField";
import { NumberInput } from "@/widgets/numericInputWidgets";
import CheckItem from "@/widgets/CheckItem";
import StartEndPickers from "@/widgets/StartEndPickers.tsx";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import { useWatch } from "antd/es/form/Form";

export default function EventCard() {
  const brauchtPresse = useWatch(["presse", "checked"], { preserve: true });
  const brauchtTechnik = useWatch(["technik", "checked"], { preserve: true });

  return (
    <Collapsible label="Event" noTopBorder suffix="allgemeines">
      <JazzRow>
        <Col span={8}>
          <CheckItem label="Ist bestätigt" name={["kopf", "confirmed"]} />
          <CheckItem label="Braucht Technik" name="brauchtTechnik" />
          <CheckItem label="Braucht Presse" name="brauchtPresse" />
          <CheckItem label="Braucht Bar" name="brauchtBar" />
        </Col>
        <Col span={8}>
          {brauchtTechnik ? (
            <>
              <CheckItem label="Technik ist geklärt" name={["technik", "checked"]} />
              <CheckItem label="Flügel stimmen" name={["technik", "fluegel"]} />
            </>
          ) : null}
          {brauchtPresse ? (
            <>
              <CheckItem label="Presse OK" name={["presse", "checked"]} />
              <CheckItem label="Fotograf einladen" name={["kopf", "fotografBestellen"]} />
            </>
          ) : null}
        </Col>
        <Col span={8}>
          <CheckItem label="Ist auf Homepage" name={["kopf", "kannAufHomePage"]} />
          <CheckItem label="Kann Social Media" name={["kopf", "kannInSocialMedia"]} />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={16}>
          <TextField label="Titel" name={["kopf", "titel"]} required />
        </Col>
        <Col span={8}>
          <NumberInput decimals={2} label="Saalmiete" name={["saalmiete"]} suffix="€" />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={24}>
          <StartEndPickers />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
