import { App, Button, Col, Form, Row } from "antd";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { openKassenzettel } from "@/commons/loader.ts";
import React, { useContext, useEffect, useMemo, useState } from "react";
import SingleSelect from "@/widgets/SingleSelect";
import { DynamicItem } from "@/widgets/DynamicItem";
import { TextField } from "@/widgets/TextField";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { Dayjs } from "dayjs";
import { VeranstaltungContext } from "@/components/veranstaltung/VeranstaltungComp.tsx";
import { useForm } from "antd/es/form/Form";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

export function KassenzettelFreigabe() {
  const veranstContext = useContext(VeranstaltungContext);
  const form = veranstContext!.form;

  const { modal } = App.useApp();
  const { currentUser, allUsers } = useJazzContext();
  const [usersAsOptions, setUsersAsOptions] = useState<string[]>([]);

  useEffect(() => {
    setUsersAsOptions(allUsers.map((user) => user.name));
  }, [allUsers]);

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
            onClick={() => openKassenzettel(form.getFieldsValue(true))}
            tooltipTitle="Kassenzettel asl PDF"
            color={color("kasse")}
          />
        </Col>
        <Col span={10} offset={4}>
          <DynamicItem
            nameOfDepending={["startDate"]}
            renderWidget={(getFieldValue) => {
              const start: Dayjs = getFieldValue("startAndEnd").start;
              const vergangen = new DatumUhrzeit(start).istVor(new DatumUhrzeit());
              return vergangen ? (
                <DynamicItem
                  nameOfDepending={["kasse", "kassenfreigabe"]}
                  renderWidget={(getFieldValue) => {
                    const freigabe = getFieldValue(["kasse", "kassenfreigabe"]);
                    if (!freigabe) {
                      return (
                        <ButtonWithIcon block text="Kasse freigeben..." icon={"Unlock"} onClick={freigeben} disabled={!darfFreigeben} />
                      );
                    } else {
                      return (
                        <>
                          <Button
                            block
                            icon={<IconForSmallBlock iconName={"Lock"} />}
                            type="primary"
                            danger
                            onClick={freigabeAufheben}
                            disabled={!darfFreigabeAufheben}
                          >
                            &nbsp;Kasse ist freigegeben
                          </Button>
                          <TextField name={["kasse", "kassenfreigabe"]} label="Durch" disabled />
                        </>
                      );
                    }
                  }}
                />
              ) : (
                <></>
              );
            }}
          />
        </Col>
      </Row>
    </>
  );
}
