import React, { useCallback, useEffect, useMemo } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Checkbox, Col, Form } from "antd";
import { TextField } from "@/widgets/TextField";
import SingleSelect from "@/widgets/SingleSelect";
import { NumberInput } from "@/widgets/numericInputWidgets";
import CheckItem from "@/widgets/CheckItem";
import PreisprofilSelect from "@/widgets/PreisprofilSelect";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import StartEndPickers from "@/widgets/StartEndPickers.tsx";
import Konzert from "jc-shared/konzert/konzert.ts";
import { EventTypeSelect } from "@/widgets/EventTypeSelects/EventTypeSelect.tsx";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import find from "lodash/find";
import { JazzRow } from "@/widgets/JazzRow";
import MitarbeiterMultiSelect from "@/widgets/MitarbeiterMultiSelect.tsx";
import filter from "lodash/filter";
import map from "lodash/map";
import { useWatch } from "antd/es/form/Form";
import { useParams } from "react-router";

function Checker({ name, label, disabled }: { readonly label: string; readonly name: string | string[]; readonly disabled?: boolean }) {
  return (
    <Col span={6}>
      <CheckItem disabled={disabled} label={label} name={name} />
    </Col>
  );
}

export default function EventCard() {
  const form = useFormInstance<Konzert>();
  const { currentUser, optionen, orte, allUsers } = useJazzContext();
  const { url } = useParams();
  const id = useWatch("id", { preserve: true });

  useEffect(() => {
    if ((url?.endsWith("new") || url?.includes("copy-of")) && currentUser) {
      form.setFieldValue("booker", [currentUser.id]);
    }
  }, [currentUser, form, id, url]);

  // eslint-disable-next-line lodash/prop-shorthand
  const bookersOnly = useMemo(() => filter(allUsers, (u) => u.accessrights.isBookingTeam), [allUsers]);
  const bookersAsOptions = useMemo(() => map(bookersOnly, "asUserAsOption"), [bookersOnly]);

  const isBookingTeam = useMemo(() => currentUser.accessrights.isBookingTeam, [currentUser.accessrights.isBookingTeam]);

  const ortChanged = useCallback(() => {
    const konzert = new Konzert(form.getFieldsValue(true));
    const selectedOrt = find(orte.orte, ["name", konzert.kopf.ort]);
    if (selectedOrt) {
      form.setFieldsValue({
        kopf: {
          pressename: selectedOrt.pressename || konzert.kopf.ort,
          presseIn: selectedOrt.presseIn || selectedOrt.pressename,
          flaeche: selectedOrt.flaeche,
        },
      });
    }

    form.validateFields();
  }, [form, orte.orte]);

  useEffect(ortChanged, [ortChanged]);

  return (
    <Collapsible label="Event" noTopBorder suffix="allgemeines">
      <JazzRow>
        <Checker disabled={!isBookingTeam} label="Ist bestätigt" name={["kopf", "confirmed"]} />
        <Checker label="Technik ist geklärt" name={["technik", "checked"]} />
        <Checker label="Braucht Presse" name="brauchtPresse" />
        <Checker label="Presse OK" name={["presse", "checked"]} />
        <Checker label="Ist abgesagt" name={["kopf", "abgesagt"]} />
        <Checker label="Braucht Hotel" name={["artist", "brauchtHotel"]} />
        <Checker label="Flügel stimmen" name={["technik", "fluegel"]} />
        <Checker label="Fotograf einladen" name={["kopf", "fotografBestellen"]} />
        <Checker label="Ist auf Homepage" name={["kopf", "kannAufHomePage"]} />
        <Checker label="Kann Social Media" name={["kopf", "kannInSocialMedia"]} />
        <Col span={12}>
          <MitarbeiterMultiSelect label="Booker" name="booker" singleEntry usersAsOptions={bookersAsOptions} />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={12}>
          <TextField label="Titel" name={["kopf", "titel"]} required />
        </Col>
        <Col span={12}>
          <EventTypeSelect />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={24}>
          <StartEndPickers />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={8}>
          <SingleSelect label="Ort" name={["kopf", "ort"]} onChange={ortChanged} options={orte.alleNamen()} />
        </Col>
        <Col span={8}>
          <NumberInput decimals={0} label="Fläche" name={["kopf", "flaeche"]} />
        </Col>
        <Col span={8}>
          <NumberInput decimals={2} disabled label="Saalmiete (alt)" name={["kosten", "saalmiete"]} suffix="€" />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={7}>
          <SingleSelect label="Koop (Rechnung)" name={["kopf", "kooperation"]} options={optionen.kooperationen} />
        </Col>
        <Col span={1}>
          <Form.Item label="&nbsp;" name={["kopf", "rechnungAnKooperation"]} valuePropName="checked">
            <Checkbox />
          </Form.Item>
        </Col>
        <Col span={8}>
          <PreisprofilSelect optionen={optionen} />
        </Col>
        <Col span={8}>
          <SingleSelect label="Genre" name={["kopf", "genre"]} options={optionen.genres} />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
