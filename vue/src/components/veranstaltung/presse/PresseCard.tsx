import OptionValues from "jc-shared/optionen/optionValues";
import React, { useEffect, useMemo, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Form, FormInstance, Row, Tabs } from "antd";
import { TextField } from "@/widgets-react/TextField";
import CheckItem from "@/widgets-react/CheckItem";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import Uploader from "@/components/veranstaltung/Uploader";
import SimpleMdeReact from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import SingleSelect from "@/widgets-react/SingleSelect";
import { useQuery } from "@tanstack/react-query";
import { imagenames } from "@/commons/loader-for-react";
import Renderer from "jc-shared/commons/renderer";
import VeranstaltungFormatter from "jc-shared/veranstaltung/veranstaltungFormatter";
import { fromFormObject } from "@/components/veranstaltung/veranstaltungCompUtils";
import { buttonType, useColorsAndIconsForSections } from "@/components/colorsIconsForSections";
import { DynamicItem } from "@/widgets-react/DynamicItem";
import { PressePreview } from "@/components/veranstaltung/presse/PressePreview";

interface PresseCardParams {
  form: FormInstance<Veranstaltung>;
  optionen: OptionValues;
  veranstaltung: Veranstaltung;
}

export default function PresseCard({ form, optionen, veranstaltung }: PresseCardParams) {
  const allimages = useQuery({ queryKey: ["imagenames"], queryFn: () => imagenames() });

  const { color } = useColorsAndIconsForSections("presse");
  const [veranstForPreview, setVeranstForPreview] = useState<Veranstaltung>(new Veranstaltung());
  const presseText = Form.useWatch(["presse", "text"]);
  const url = Form.useWatch(["presse", "jazzclubURL"]);
  const image = Form.useWatch(["presse", "image"]);

  const editorOptions = useMemo(() => ({ status: false, spellChecker: false, sideBySideFullscreen: false, minHeight: "500px" }), []);

  useEffect(() => {
    const veranst = fromFormObject(form);
    setVeranstForPreview(veranst);
    //updatePreview(veranst);
  }, [presseText, url, image]);

  function imageUebernehmen(val: string) {
    const name = ["presse", "image"];
    const imagelist = form.getFieldValue(name);
    form.setFieldValue(name, [...imagelist, val]);
    form.setFieldValue(["tempimage"], null);
  }

  const [activePage, setActivePage] = useState<string>("final");

  function TabLabel(props: { kind: buttonType; title: string }) {
    const farbe = color();
    const active = activePage === props.kind;
    return (
      <b style={{ margin: -16, padding: 16, backgroundColor: active ? farbe : "inherit", color: active ? "#FFF" : farbe }}>{props.title}</b>
    );
  }

  return (
    <CollapsibleForVeranstaltung suffix="presse" label="Pressematerial" noTopBorder>
      <Row gutter={12}>
        <Col span={12}>
          <CheckItem name={["presse", "checked"]} label="Ist so OK" />
          <TextField name={["presse", "jazzclubURL"]} label="URL-Suffix bei jazzclub.de" />
          <Tabs
            activeKey={activePage}
            onChange={setActivePage}
            type="card"
            items={[
              {
                key: "final",
                label: <TabLabel kind="final" title="Finaler Text" />,
                children: (
                  <Form.Item label={<b>Formatierter Text für die Pressemitteilung:</b>} name={["presse", "text"]}>
                    <SimpleMdeReact autoFocus options={editorOptions} />
                  </Form.Item>
                ),
              },
              {
                key: "original",
                label: <TabLabel kind="original" title="Originaler Text" />,
                children: (
                  <Form.Item label={<b>Formatierter Text für die Pressemitteilung:</b>} name={["presse", "originalText"]}>
                    <SimpleMdeReact autoFocus options={editorOptions} />
                  </Form.Item>
                ),
              },
            ]}
          />
          <Uploader form={form} veranstaltung={veranstaltung} name={["presse", "image"]} typ={"pressefoto"} />
          <SingleSelect name={["tempimage"]} label={"Vorhandene Bilder übernehmen"} options={allimages.data} onChange={imageUebernehmen} />
        </Col>
        <Col span={12}>
          <PressePreview veranstaltung={veranstForPreview} />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
