import { App, Col, Flex, Form, Typography } from "antd";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { openKassenzettel } from "@/rest/loader.ts";
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
          <SingleSelect initialValue={currentUser.name} label="User für die Freigabe" name="freigeber" options={usersAsOptions} />
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
            color={color("kasse")}
            disabled={isDirty}
            icon="PrinterFill"
            onClick={() => openKassenzettel(new Konzert(form.getFieldsValue(true)))}
            text="Kassenzettel"
            tooltipTitle="Kassenzettel als PDF"
          />
        </Col>
        <Col offset={4} span={10}>
          {vergangen ? (
            !freigabe ? (
              <ButtonWithIcon
                block
                disabled={
                  isDirty || !darfFreigeben || numeral(endbestandEUR).format("0.00") !== numeral(endbestandGezaehltEUR).format("0.00")
                }
                icon="Unlock"
                onClick={freigeben}
                text="Kasse freigeben..."
              />
            ) : (
              <>
                <ButtonWithIcon
                  block
                  color="#c71c2c"
                  disabled={isDirty || !darfFreigabeAufheben}
                  icon="Lock"
                  onClick={freigabeAufheben}
                  text="Kasse ist freigegeben"
                  type="primary"
                />
                <TextField disabled label="Durch" name={["kasse", "kassenfreigabe"]} />
              </>
            )
          ) : null}
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
              {darfFreigeben ? <b>Freigabe nicht möglich.</b> : null}
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
        <Col offset={4} span={10}>
          <MuenzenScheineModal isBeginn={false} />
        </Col>
      </JazzRow>
    </>
  );
}
