import { App, Col, Flex, Form, Row } from "antd";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { openKassenzettel } from "@/commons/loader.ts";
import React, { useContext, useEffect, useMemo, useState } from "react";
import SingleSelect from "@/widgets/SingleSelect";
import { TextField } from "@/widgets/TextField";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { KonzertContext } from "@/components/konzert/KonzertComp.tsx";
import { useForm } from "antd/es/form/Form";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { MuenzenScheineModal } from "@/components/konzert/kasse/MuenzenScheineModal.tsx";

export function KassenzettelFreigabe() {
  const konzertContext = useContext(KonzertContext);
  const form = konzertContext!.form;

  const { modal } = App.useApp();
  const { currentUser, allUsers } = useJazzContext();
  const [usersAsOptions, setUsersAsOptions] = useState<string[]>([]);

  useEffect(() => {
    setUsersAsOptions(allUsers.map((user) => user.name));
  }, [allUsers]);

  const startAndEnd = Form.useWatch("startAndEnd", { form, preserve: true });
  const vergangen = useMemo(() => {
    return new DatumUhrzeit(startAndEnd?.start).istVor(new DatumUhrzeit());
  }, [startAndEnd]);

  const freigabe = Form.useWatch(["kasse", "kassenfreigabe"], { form, preserve: true });
  const endbestandEUR = Form.useWatch("endbestandEUR", { form, preserve: true });
  const endbestandGezaehltEUR = Form.useWatch(["kasse", "endbestandGezaehltEUR"], { form, preserve: true });

  const [innerForm] = useForm();

  function freigeben() {
    modal.confirm({
      type: "confirm",
      title: "Kasse freigeben",
      content: (
        <Form form={innerForm} layout="vertical">
          <p>
            <IconForSmallBlock color="red" iconName={"ExclamationCircleFill"} /> Nach dem Freigeben ist keine Änderung mehr möglich!
          </p>
          <p>Du musst danach noch Speichern, dabei wird der Kassenzettel an die Buchhaltung gesendet.</p>
          <SingleSelect name="freigeber" label={"User für die Freigabe"} options={usersAsOptions} initialValue={currentUser.name} />
        </Form>
      ),
      onOk: () => {
        form.setFieldValue(["kasse", "kassenfreigabe"], innerForm.getFieldValue("freigeber"));
        form.setFieldValue(["kasse", "kassenfreigabeAm"], new Date());
      },
    });
  }

  function freigabeAufheben() {
    form.setFieldValue(["kasse", "kassenfreigabe"], currentUser.name);
    modal.confirm({
      type: "confirm",
      title: "Kassenfreigabe rückgängig",
      content: "Bist Du sicher?",
      onOk: () => {
        form.setFieldValue(["kasse", "kassenfreigabe"], "");
        form.setFieldValue(["kasse", "kassenfreigabeAm"], undefined);
      },
    });
  }

  const { color } = colorsAndIconsForSections;
  const darfFreigeben = useMemo(() => currentUser.accessrights.darfKasseFreigeben, [currentUser.accessrights.darfKasseFreigeben]);
  const darfFreigabeAufheben = useMemo(() => currentUser.accessrights.isSuperuser, [currentUser.accessrights.isSuperuser]);

  return (
    <>
      <Row gutter={12}>
        <Col span={10}>
          <ButtonWithIcon
            block
            text="Kassenzettel"
            icon="PrinterFill"
            disabled={konzertContext?.isDirty}
            onClick={() => openKassenzettel(form.getFieldsValue(true))}
            tooltipTitle="Kassenzettel als PDF"
            color={color("kasse")}
          />
        </Col>
        <Col span={10} offset={4}>
          {vergangen &&
            (!freigabe ? (
              <ButtonWithIcon
                block
                text="Kasse freigeben..."
                icon={"Unlock"}
                onClick={freigeben}
                disabled={konzertContext?.isDirty || !darfFreigeben || endbestandEUR !== endbestandGezaehltEUR}
              />
            ) : (
              <>
                <ButtonWithIcon
                  block
                  icon="Lock"
                  text="Kasse ist freigegeben"
                  type="primary"
                  color="#c71c2c"
                  onClick={freigabeAufheben}
                  disabled={konzertContext?.isDirty || !darfFreigabeAufheben}
                />
                <TextField name={["kasse", "kassenfreigabe"]} label="Durch" disabled />
              </>
            ))}
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={24}>
          {endbestandEUR !== endbestandGezaehltEUR ? (
            <Flex justify="center">
              <b
                style={{
                  color: "#d50f36",
                }}
              >
                ACHTUNG! Endbestände unplausibel
              </b>
              &nbsp;
              {darfFreigeben && <b>Freigabe nicht möglich.</b>}
            </Flex>
          ) : (
            <>&nbsp;</>
          )}
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={10}>
          <MuenzenScheineModal isBeginn={true} />
        </Col>
        <Col span={10} offset={4}>
          <MuenzenScheineModal isBeginn={false} />
        </Col>
      </Row>
    </>
  );
}
