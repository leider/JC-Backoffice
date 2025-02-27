import { Col, Collapse, CollapseProps, ConfigProvider, Form, FormInstance, Row, Space } from "antd";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import ThreewayCheckbox from "@/widgets/ThreewayCheckbox.tsx";
import React from "react";
import { TeamFilterObject } from "@/components/team/TeamFilter/applyTeamFilter.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { EventTypeMultiSelect } from "@/widgets/EventTypeSelects/EventTypeMultiSelect.tsx";
import { reset } from "@/components/team/TeamFilter/resetTeamFilter.ts";
import { JazzModal } from "@/widgets/JazzModal.tsx";

export function TeamFilterEdit({
  form,
  open,
  setOpen,
}: {
  form: FormInstance<TeamFilterObject>;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { setFilter } = useJazzContext();

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
            <Col span={8}>
              <ThreewayCheckbox name="istKonzert" label="Ist Konzert" />
            </Col>
            <Col span={8}>
              <ThreewayCheckbox name={["kopf", "confirmed"]} label="Ist bestätigt" />
            </Col>
            <Col span={8}>
              <ThreewayCheckbox name={["kopf", "abgesagt"]} label="Ist abgesagt" />
            </Col>
            <Col span={8}>
              <ThreewayCheckbox name="hotelBestaetigt" label="Hotel bestätigt" />
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
            <ThreewayCheckbox name={["presse", "checked"]} label="Presse OK" />
          </Col>
          <Col span={8}>
            <ThreewayCheckbox name={["kopf", "kannAufHomePage"]} label="Ist auf Homepage" />
          </Col>
          <Col span={8}>
            <ThreewayCheckbox name={["kopf", "kannInSocialMedia"]} label="Kann Social Media" />
          </Col>
          <Col span={8}>
            <ThreewayCheckbox name={["presse", "text"]} label="Text vorhanden" />
          </Col>
          <Col span={8}>
            <ThreewayCheckbox name={["presse", "originalText"]} label="Originaltext vorhanden" />
          </Col>
          <Col span={8}>
            <ThreewayCheckbox name={["kopf", "fotografBestellen"]} label="Fotograf einladen" />
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
            <ThreewayCheckbox name={["technik", "checked"]} label="Technik ist geklärt" />
          </Col>
          <Col span={8}>
            <ThreewayCheckbox name={["technik", "fluegel"]} label="Flügel stimmen" />
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
            type="default"
            text="Zurücksetzen"
            onClick={() => {
              reset(form);
              setFilter(form.getFieldsValue(true));
            }}
          />
          <ButtonWithIcon alwaysText type="default" text="Schließen" onClick={() => setOpen(false)} />
          <ButtonWithIcon
            alwaysText
            text="Anwenden"
            onClick={() => {
              setOpen(false);
              setFilter(form.getFieldsValue(true));
            }}
          />
        </Space>
      }
      open={open}
    >
      <Form form={form} autoComplete="off" size="small" colon={false} onValuesChange={() => setFilter(form.getFieldsValue(true))}>
        <ConfigProvider theme={{ components: { Collapse: { contentPadding: 0 } } }}>
          <Collapse defaultActiveKey={["Allgemein", "Erklärung"]} ghost items={items} />
        </ConfigProvider>
      </Form>
    </JazzModal>
  );
}
