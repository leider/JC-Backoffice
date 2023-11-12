import { App, Button, Col, Form, Row } from "antd";
import { IconForSmallBlock } from "@/components/Icon";
import { allUsers, openKassenzettel } from "@/commons/loader.ts";
import React, { useContext, useEffect, useState } from "react";
import SingleSelect from "@/widgets/SingleSelect";
import { useAuth } from "@/commons/auth";
import { DynamicItem } from "@/widgets/DynamicItem";
import { TextField } from "@/widgets/TextField";
import { ButtonKassenzettel } from "@/components/Buttons";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { Dayjs } from "dayjs";
import { VeranstaltungContext } from "@/components/veranstaltung/VeranstaltungComp.tsx";
import { useForm } from "antd/es/form/Form";
import ButtonWithIcon from "@/widgets/ButtonWithIcon.tsx";

export function KassenzettelFreigabe() {
  const veranstContext = useContext(VeranstaltungContext);
  const form = veranstContext!.form;

  const { modal } = App.useApp();
  const { context } = useAuth();
  const [usersAsOptions, setUsersAsOptions] = useState<string[]>([]);

  async function loadUsers() {
    const users = await allUsers();
    setUsersAsOptions(users.map((user) => user.name));
  }

  useEffect(() => {
    loadUsers();
  }, []);

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
          <SingleSelect
            name="freigeber"
            label={"User für die Freigabe"}
            options={usersAsOptions}
            initialValue={context?.currentUser.name}
          />
        </Form>
      ),
      onOk: () => {
        form.setFieldValue(["kasse", "kassenfreigabe"], innerForm.getFieldValue("freigeber"));
        form.setFieldValue(["kasse", "kassenfreigabeAm"], new Date());
      },
    });
  }

  function freigabeAufheben() {
    form.setFieldValue(["kasse", "kassenfreigabe"], context?.currentUser.name);
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

  return (
    <>
      <Row gutter={12}>
        <Col span={10}>
          <ButtonKassenzettel callback={() => openKassenzettel(form.getFieldsValue(true))} />
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
                      const darfFreigeben = context?.currentUser.accessrights?.darfKasseFreigeben;
                      return (
                        <ButtonWithIcon
                          block
                          text="Kasse freigeben..."
                          icon={"Unlock"}
                          type="primary"
                          onClick={freigeben}
                          disabled={!darfFreigeben}
                        />
                      );
                    } else {
                      const darfFreigabeAufheben = context?.currentUser.accessrights?.isSuperuser;
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
