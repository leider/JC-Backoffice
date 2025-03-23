import { Col, Collapse, CollapseProps, ConfigProvider, Form, FormInstance, Row, Space } from "antd";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import ThreewayCheckbox from "@/widgets/ThreewayCheckbox.tsx";
import React, { useMemo } from "react";
import { TeamFilterObject } from "@/components/team/TeamFilter/applyTeamFilter.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { EventTypeMultiSelect } from "@/widgets/EventTypeSelects/EventTypeMultiSelect.tsx";
import { reset } from "@/components/team/TeamFilter/resetTeamFilter.ts";
import { JazzModal } from "@/widgets/JazzModal.tsx";
import MitarbeiterMultiSelect from "@/widgets/MitarbeiterMultiSelect.tsx";
import filter from "lodash/filter";
import map from "lodash/map";

export function TeamFilterEdit({
  form,
  open,
  setOpen,
}: {
  readonly form: FormInstance<TeamFilterObject>;
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
}) {
  const { allUsers, setFilter } = useJazzContext();

  // eslint-disable-next-line lodash/prop-shorthand
  const bookersOnly = useMemo(() => filter(allUsers, (u) => u.accessrights.isBookingTeam), [allUsers]);
  const bookersAsOptions = useMemo(() => map(bookersOnly, "asUserAsOption"), [bookersOnly]);

  const items: CollapseProps["items"] = [
    {
      id: "Filter-Allgemein",
      key: "Allgemein",
      label: <b>Allgemein</b>,
      children: (
        <>
          <Row gutter={8}>
            <Col span={24}>
              <EventTypeMultiSelect />
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={24}>
              <MitarbeiterMultiSelect label="Booker" name="booker" usersAsOptions={bookersAsOptions} />
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={8}>
              <ThreewayCheckbox label="Ist Konzert" name="istKonzert" />
            </Col>
            <Col span={8}>
              <ThreewayCheckbox label="Ist bestätigt" name={["kopf", "confirmed"]} />
            </Col>
            <Col span={8}>
              <ThreewayCheckbox label="Ist abgesagt" name={["kopf", "abgesagt"]} />
            </Col>
            <Col span={8}>
              <ThreewayCheckbox label="Hotel bestätigt" name="hotelBestaetigt" />
            </Col>
          </Row>
        </>
      ),
    },
    {
      id: "Filter-Öffentlichkeit",
      key: "Öffentlichkeit",
      label: <b>Öffentlichkeit</b>,
      children: (
        <Row gutter={8}>
          <Col span={8}>
            <ThreewayCheckbox label="Presse OK" name={["presse", "checked"]} />
          </Col>
          <Col span={8}>
            <ThreewayCheckbox label="Ist auf Homepage" name={["kopf", "kannAufHomePage"]} />
          </Col>
          <Col span={8}>
            <ThreewayCheckbox label="Kann Social Media" name={["kopf", "kannInSocialMedia"]} />
          </Col>
          <Col span={8}>
            <ThreewayCheckbox label="Text vorhanden" name={["presse", "text"]} />
          </Col>
          <Col span={8}>
            <ThreewayCheckbox label="Originaltext vorhanden" name={["presse", "originalText"]} />
          </Col>
          <Col span={8}>
            <ThreewayCheckbox label="Fotograf einladen" name={["kopf", "fotografBestellen"]} />
          </Col>
        </Row>
      ),
    },
    {
      id: "Filter-Technik",
      key: "Technik",
      label: <b>Technik</b>,
      children: (
        <Row gutter={8}>
          <Col span={8}>
            <ThreewayCheckbox label="Technik ist geklärt" name={["technik", "checked"]} />
          </Col>
          <Col span={8}>
            <ThreewayCheckbox label="Flügel stimmen" name={["technik", "fluegel"]} />
          </Col>
        </Row>
      ),
    },
    {
      key: "Erklärung",
      label: <b>Erklärung</b>,
      children: (
        <p style={{ marginBlock: 0 }}>
          Hier kannst Du nach bestimmten Eigenschaften suchen.
          <br />
          Anhaken bedeutet: "Das muss gesetzt sein".
          <br />
          Nicht anhaken: "Das <em>darf nicht</em> gesetzt sein".
          <br />
          Das "Quadrat": Ignoriere diese Eigenschaft.
        </p>
      ),
    },
  ];

  return (
    <JazzModal
      closable={false}
      footer={
        <Space>
          <ButtonWithIcon
            alwaysText
            onClick={() => {
              reset(form);
              setFilter(form.getFieldsValue(true));
            }}
            text="Zurücksetzen"
            type="default"
          />
          <ButtonWithIcon
            alwaysText
            onClick={() => {
              setOpen(false);
              setFilter(form.getFieldsValue(true));
            }}
            text="Schließen"
          />
        </Space>
      }
      open={open}
    >
      <Form autoComplete="off" colon={false} form={form} onValuesChange={() => setFilter(form.getFieldsValue(true))} size="small">
        <ConfigProvider theme={{ components: { Collapse: { contentPadding: 0 } } }}>
          <Collapse defaultActiveKey={["Allgemein", "Erklärung"]} ghost items={items} />
        </ConfigProvider>
      </Form>
    </JazzModal>
  );
}
