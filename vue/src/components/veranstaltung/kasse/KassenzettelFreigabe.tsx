import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { App, Button, Col, Form, FormInstance, Row } from "antd";
import { IconForSmallBlock } from "@/components/Icon";
import { allUsers, openKassenzettel } from "@/commons/loader-for-react";
import React, { useEffect, useState } from "react";
import SingleSelect from "@/widgets-react/SingleSelect";
import { useAuth } from "@/commons/auth";
import { DynamicItem } from "@/widgets-react/DynamicItem";
import { TextField } from "@/widgets-react/TextField";

interface KassenzettelFreigabeParams {
  veranstaltung: Veranstaltung;
  form: FormInstance<Veranstaltung>;
  setFreigegeben: (value: ((prevState: boolean) => boolean) | boolean) => void;
}

export function KassenzettelFreigabe({ veranstaltung, form, setFreigegeben }: KassenzettelFreigabeParams) {
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

  function freigeben() {
    form.setFieldValue(["kasse", "kassenfreigabe"], context?.currentUser.name),
      modal.confirm({
        type: "confirm",
        title: "Kasse freigeben",
        content: (
          <Form form={form} layout="vertical">
            <p>
              <IconForSmallBlock color="red" iconName={"ExclamationCircleFill"} /> Nach dem Freigeben ist keine Änderung mehr möglich!
            </p>
            <p>Du musst danach noch Speichern, dabei wird der Kassenzettel an die Buchhaltung gesendet.</p>
            <SingleSelect name={["kasse", "kassenfreigabe"]} label={"User für die Freigabe"} options={usersAsOptions} />
          </Form>
        ),
        onOk: () => {
          form.setFieldValue(["kasse", "kassenfreigabeAm"], new Date());
          setFreigegeben(true);
        },
        onCancel: () => {
          form.setFieldValue(["kasse", "kassenfreigabe"], "");
        },
      });
  }

  function freigabeAufheben() {
    form.setFieldValue(["kasse", "kassenfreigabe"], context?.currentUser.name),
      modal.confirm({
        type: "confirm",
        title: "Kassenfreigabe rückgängig",
        content: "Bist Du sicher?",
        onOk: () => {
          form.setFieldValue(["kasse", "kassenfreigabe"], "");
          form.setFieldValue(["kasse", "kassenfreigabeAm"], undefined);
          setFreigegeben(false);
        },
      });
  }

  return (
    <>
      <Row gutter={12}>
        <Col span={10}>
          <Button
            block
            icon={<IconForSmallBlock iconName={"PrinterFill"} />}
            type="primary"
            onClick={() => openKassenzettel(form.getFieldsValue(true))}
            className={`btn-kasse`}
          >
            &nbsp;Kassenzettel
          </Button>
        </Col>
        <Col span={10} offset={4}>
          <DynamicItem
            nameOfDepending={["kasse", "kassenfreigabe"]}
            renderWidget={(getFieldValue) => {
              const freigabe = getFieldValue(["kasse", "kassenfreigabe"]);
              if (!freigabe) {
                const darfFreigeben = veranstaltung.istVergangen && context?.currentUser.accessrights?.darfKasseFreigeben;
                return (
                  <Button
                    block
                    icon={<IconForSmallBlock iconName={"Unlock"} />}
                    type="primary"
                    onClick={freigeben}
                    disabled={!darfFreigeben}
                  >
                    &nbsp;Kasse freigeben
                  </Button>
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
        </Col>
      </Row>
    </>
  );
}
