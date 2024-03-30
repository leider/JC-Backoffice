import React, { useEffect, useMemo, useState } from "react";
import { Col, Divider, Form, Modal, Row, Space, Tag } from "antd";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { TeamFilterObject } from "@/components/team/applyTeamFilter.ts";
import ThreewayCheckbox from "@/widgets/ThreewayCheckbox.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import isNil from "lodash/isNil";
import { withoutNullOrUndefinedStrippedBy } from "jc-shared/commons/comparingAndTransforming.ts";
import isEmpty from "lodash/isEmpty";
import { NamePath } from "rc-field-form/es/interface";

type LabelColorProperty = {
  label: string;
  color: boolean;
  prop?: NamePath;
};

export default function useFilterAsTags() {
  const [open, setOpen] = useState(false);

  const [form] = Form.useForm<TeamFilterObject>();

  const { filter: filterObj, setFilter } = useJazzContext();

  useEffect(() => {
    form.setFieldsValue(filterObj);
  }, [filterObj, form]);

  function headerTagsForFilters(labelsColors: LabelColorProperty[]) {
    function HeaderTag({ label, color, prop }: LabelColorProperty) {
      return (
        <Tag
          key={label}
          color={color ? "success" : "error"}
          closeIcon={!!prop}
          onClose={() => {
            if (prop) {
              form.setFieldValue(prop, undefined);
              setFilter(form.getFieldsValue(true));
            }
          }}
        >
          {label}
        </Tag>
      );
    }
    return labelsColors.map((tag) => <HeaderTag key={tag.label} label={tag.label} color={tag.color} prop={tag.prop} />);
  }

  function reset() {
    form.setFieldsValue({
      istKonzert: undefined,
      presse: { text: undefined, originalText: undefined, checked: undefined },
      kopf: {
        confirmed: undefined,
        abgesagt: undefined,
        kannAufHomePage: undefined,
        kannInSocialMedia: undefined,
        fotografBestellen: undefined,
      },
      technik: { checked: undefined, fluegel: undefined },
    });
  }

  function TeamFilterEdit() {
    return (
      <Modal
        footer={
          <Space>
            <ButtonWithIcon alwaysText type="default" text="Zurücksetzen" onClick={reset} />
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
        <Form form={form} autoComplete="off">
          <Divider orientation="left">
            <b>Allgemein</b>
          </Divider>
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
          </Row>
          <Divider orientation="left">
            <b>Öffentlichkeit</b>
          </Divider>
          <Row gutter={8}>
            <Col span={8}>
              <ThreewayCheckbox name={["presse", "checked"]} label="Presse OK" />
            </Col>
            <Col span={8}>
              <ThreewayCheckbox name={["kopf", "kannAufHomePage"]} label="Kann Homepage" />
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
          <Divider orientation="left">
            <b>Technik</b>
          </Divider>
          <Row gutter={8}>
            <Col span={8}>
              <ThreewayCheckbox name={["technik", "checked"]} label="Technik ist geklärt" />
            </Col>
            <Col span={8}>
              <ThreewayCheckbox name={["technik", "fluegel"]} label="Flügel stimmen" />
            </Col>
          </Row>
          <Divider orientation="left">
            <b>Erlärung</b>
          </Divider>
          <Row gutter={8}>
            <p>
              Hier kannst Du nach bestimmten Eigenschaften suchen.
              <br />
              Anhaken bedeutet: "Das muss gesetzt sein".
              <br />
              Nicht anhaken: "Das <em>darf nicht</em> gesetzt sein".
            </p>
          </Row>
        </Form>
      </Modal>
    );
  }

  const filter = withoutNullOrUndefinedStrippedBy(filterObj);

  const taggies = useMemo(() => {
    function pushIfSet(att: boolean | undefined, label: string, prop?: NamePath) {
      if (!isNil(att)) {
        tags.push({ label, color: att, prop });
      }
    }
    const tags: LabelColorProperty[] = [];
    if (!isNil(filter.istKonzert)) {
      tags.push(
        filter.istKonzert
          ? { label: "nur Konzerte", color: true, prop: "istKonzert" }
          : { label: "nur Vermietungen", color: true, prop: "istKonzert" },
      );
    }
    pushIfSet(filter.kopf?.confirmed, "Ist bestätigt", ["kopf", "confirmed"]);
    pushIfSet(filter.kopf?.abgesagt, "Ist abgesagt", ["kopf", "abgesagt"]);
    pushIfSet(filter.presse?.checked, "Presse OK", ["presse", "checked"]);
    pushIfSet(filter.kopf?.kannAufHomePage, "Kann Homepage", ["kopf", "kannAufHomePage"]);
    pushIfSet(filter.kopf?.kannInSocialMedia, "Kann Social Media", ["kopf", "kannInSocialMedia"]);
    pushIfSet(filter.presse?.text, "Text vorhanden", ["presse", "text"]);
    pushIfSet(filter.presse?.originalText, "Originaltext vorhanden", ["presse", "originalText"]);
    pushIfSet(filter.kopf?.fotografBestellen, "Fotograf einladen", ["kopf", "fotografBestellen"]);
    pushIfSet(filter.technik?.checked, "Technik ist geklärt", ["technik", "checked"]);
    pushIfSet(filter.technik?.fluegel, "Flügel stimmen", ["technik", "fluegel"]);
    return tags;
  }, [filter]);

  const result = [
    <span key="aktiveFilter">
      <ButtonWithIcon alwaysText type="default" size="small" text="Filter..." onClick={() => setOpen(true)} />
      <TeamFilterEdit />
    </span>,
  ];
  if (!isEmpty(taggies)) {
    result.push(
      <ButtonWithIcon
        alwaysText
        type="default"
        size="small"
        key="resetFilter"
        text="Zurücksetzen"
        onClick={() => {
          reset();
          setFilter(form.getFieldsValue(true));
        }}
      />,
    );
  }
  result.push(...headerTagsForFilters(taggies));
  return result;
}
