import { PageHeader } from "@ant-design/pro-layout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { optionen as optionenRestCall, saveOptionen } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useState } from "react";
import OptionValues from "jc-shared/optionen/optionValues";
import { App, Col, Form, Row, Tabs, TabsProps } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { useColorsAndIconsForSections } from "@/components/colorsIconsForSections";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import { SaveButton } from "@/components/colored/JazzButtons";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { CollectionColDesc, InlineCollectionEditable } from "@/widgets/InlineCollectionEditable";

export default function Optionen() {
  const opts = useQuery({ queryKey: ["optionen"], queryFn: optionenRestCall });
  const [optionen, setOptionen] = useState<OptionValues>(new OptionValues());
  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);
  const queryClient = useQueryClient();

  document.title = "Optionen";

  useEffect(() => {
    if (opts.data) {
      setOptionen(opts.data);
    }
  }, [opts.data]);

  const { notification } = App.useApp();
  const mutateOptionen = useMutation({
    mutationFn: saveOptionen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["optionen"] });
      notification.open({
        message: "Speichern erfolgreich",
        description: "Die Optionen wurden gespeichert",
        duration: 5,
      });
    },
  });

  const [form] = Form.useForm<OptionValues>();

  function initializeForm() {
    const deepCopy = optionen.toJSON();
    form.setFieldsValue(deepCopy);
    const initial = optionen.toJSON();
    setInitialValue(initial);
    setDirty(areDifferent(initial, deepCopy));
    form.validateFields();
  }
  useEffect(initializeForm, [form, optionen]);

  const [activePage, setActivePage] = useState<string>("optionen");

  function TabLabel({ title, type }: { type: string; title: string }) {
    const { color } = useColorsAndIconsForSections();
    const active = activePage === type;

    const farbe = color("allgemeines");

    return (
      <b
        style={{
          margin: -16,
          padding: 16,
          backgroundColor: active ? farbe : "inherit",
          color: active ? "#FFF" : farbe,
        }}
      >
        {title}
      </b>
    );
  }

  const columnsTypen: CollectionColDesc[] = [
    { type: "text", label: "Name", required: true, fieldName: "name", width: "xl" },
    { type: "boolean", label: "Master", fieldName: "mod", width: "m" },
    { type: "boolean", label: "Kasse1", fieldName: "kasseV", width: "m" },
    { type: "boolean", label: "Kasse2", fieldName: "kasse", width: "m" },
    { type: "boolean", label: "Tech1", fieldName: "technikerV", width: "m" },
    { type: "boolean", label: "Tech2", fieldName: "techniker", width: "m" },
    { type: "boolean", label: "Merch", fieldName: "merchandise", width: "m" },
    { type: "color", label: "Farbe", fieldName: "color", width: "m" },
  ];

  const columnsPreisprofile: CollectionColDesc[] = [
    { type: "text", label: "Name", required: true, fieldName: "name", width: "m" },
    { type: "integer", label: "Regulär", required: true, fieldName: "regulaer", width: "m", min: 0 },
    { type: "integer", label: "Rabatt ermäßigt", required: true, fieldName: "rabattErmaessigt", width: "m", min: 0, initialValue: 0 },
    { type: "integer", label: "Rabatt Mitglied", required: true, fieldName: "rabattMitglied", width: "m", min: 0, initialValue: 0 },
  ];
  const { lg } = useBreakpoint();
  const tabs: TabsProps["items"] = [
    {
      key: "optionen",
      label: <TabLabel type="optionen" title="Optionen" />,
      children: (
        <>
          <Row gutter={12}>
            <Col xs={24} lg={12}>
              <CollapsibleForVeranstaltung suffix="allgemeines" label="Optionen" noTopBorder>
                <InlineCollectionEditable columnDescriptions={columnsTypen} embeddedArrayPath={["typenPlus"]} form={form} />
                <MultiSelectWithTags name="kooperationen" label={"Kooperationen"} options={optionen.kooperationen} />
                <MultiSelectWithTags name="genres" label={"Genres"} options={optionen.genres} />
              </CollapsibleForVeranstaltung>
            </Col>
            <Col xs={24} lg={12}>
              <CollapsibleForVeranstaltung suffix="ausgaben" label="Preisprofile" noTopBorder={lg}>
                <p>
                  <b>Achtung! Änderungen hier wirken sich NICHT auf bereits angelegte Veranstaltungen aus!</b>
                </p>
                <InlineCollectionEditable columnDescriptions={columnsPreisprofile} embeddedArrayPath={["preisprofile"]} form={form} />
              </CollapsibleForVeranstaltung>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={24}>
              <CollapsibleForVeranstaltung suffix="technik" label="Backlines">
                <MultiSelectWithTags name="backlineJazzclub" label={"Jazzclub"} options={optionen.backlineJazzclub} />
                <MultiSelectWithTags name="backlineRockshop" label={"Rockshop"} options={optionen.backlineRockshop} />
              </CollapsibleForVeranstaltung>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: "artists",
      label: <TabLabel type="artists" title="Künstler" />,
      children: (
        <Row gutter={12}>
          <Col span={24}>
            <CollapsibleForVeranstaltung suffix="allgemeines" label="Künstler" noTopBorder>
              <MultiSelectWithTags name="artists" label={"Künstler"} options={optionen.artists} />
            </CollapsibleForVeranstaltung>
          </Col>
        </Row>
      ),
    },
  ];

  function saveForm() {
    form.validateFields().then(async () => {
      mutateOptionen.mutate(new OptionValues(form.getFieldsValue(true)));
    });
  }
  return (
    <Form
      form={form}
      onValuesChange={() => {
        // const diff = detailedDiff(initialValue, form.getFieldsValue(true));
        // console.log({ diff });
        // console.log({ initialValue });
        // console.log({ form: form.getFieldsValue(true) });
        setDirty(areDifferent(initialValue, form.getFieldsValue(true)));
      }}
      onFinish={saveForm}
      layout="vertical"
    >
      <PageHeader title="Optionen" extra={[<SaveButton key="save" disabled={!dirty} />]}></PageHeader>
      <Tabs
        type="card"
        activeKey={activePage}
        items={tabs}
        onChange={(newPage) => {
          setActivePage(newPage);
        }}
      />
    </Form>
  );
}
