import { App, Col, Flex, Form, Typography } from "antd";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { openKassenzettel } from "@/commons/loader.ts";
import React, { useMemo } from "react";
import SingleSelect from "@/widgets/SingleSelect";
import { TextField } from "@/widgets/TextField";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { useForm, useWatch } from "antd/es/form/Form";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { MuenzenScheineModal } from "@/components/konzert/kasse/MuenzenScheineModal.tsx";
import Konzert from "jc-shared/konzert/konzert.ts";
import numeral from "numeral";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import map from "lodash/map";
import { JazzRow } from "@/widgets/JazzRow";

export function KassenzettelFreigabe() {
  const form = useFormInstance();
  const { currentUser, allUsers, isDirty } = useJazzContext();

  const { modal } = App.useApp();
  const usersAsOptions = useMemo(() => map(allUsers, "name"), [allUsers]);

  const startDate = useWatch("startDate", { form, preserve: true });
  const vergangen = useMemo(() => {
    return DatumUhrzeit.forJSDate(startDate).istVor(new DatumUhrzeit());
  }, [startDate]);

  const freigabe = useWatch(["kasse", "kassenfreigabe"], { form, preserve: true });
  const endbestandEUR = useWatch("endbestandEUR", { form, preserve: true });
  const endbestandGezaehltEUR = useWatch(["kasse", "endbestandGezaehltEUR"], { form, preserve: true });

  const [innerForm] = useForm();

  function freigeben() {
    modal.confirm({
      type: "confirm",
      title: "Kasse freigeben",
      content: (
        <Form form={innerForm} layout="vertical">
          <p>
            <IconForSmallBlock color="red" iconName="ExclamationCircleFill" /> Nach dem Freigeben ist keine Änderung mehr möglich!
          </p>
          <p>Du musst danach noch Speichern, dabei wird der Kassenzettel an die Buchhaltung gesendet.</p>
          <SingleSelect name="freigeber" label="User für die Freigabe" options={usersAsOptions} initialValue={currentUser.name} />
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
      <JazzRow>
        <Col span={10}>
          <ButtonWithIcon
            block
            text="Kassenzettel"
            icon="PrinterFill"
            disabled={isDirty}
            onClick={() => openKassenzettel(new Konzert(form.getFieldsValue(true)))}
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
                icon="Unlock"
                onClick={freigeben}
                disabled={
                  isDirty || !darfFreigeben || numeral(endbestandEUR).format("0.00") !== numeral(endbestandGezaehltEUR).format("0.00")
                }
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
                  disabled={isDirty || !darfFreigabeAufheben}
                />
                <TextField name={["kasse", "kassenfreigabe"]} label="Durch" disabled />
              </>
            ))}
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={24}>
          {numeral(endbestandEUR).format("0.00") !== numeral(endbestandGezaehltEUR).format("0.00") ? (
            <Flex justify="center">
              <Typography.Text strong type="danger">
                ACHTUNG! Endbestände unplausibel
              </Typography.Text>
              &nbsp;
              {darfFreigeben && <b>Freigabe nicht möglich.</b>}
            </Flex>
          ) : (
            <>&nbsp;</>
          )}
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={10}>
          <MuenzenScheineModal isBeginn />
        </Col>
        <Col span={10} offset={4}>
          <MuenzenScheineModal isBeginn={false} />
        </Col>
      </JazzRow>
    </>
  );
}
