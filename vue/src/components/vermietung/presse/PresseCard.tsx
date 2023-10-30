import React, { useContext, useEffect, useMemo, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Form, Row, Tabs } from "antd";
import { TextField } from "@/widgets/TextField";
import CheckItem from "@/widgets/CheckItem";
import Uploader from "@/components/veranstaltung/Uploader";
import SimpleMdeReact from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import SingleSelect from "@/widgets/SingleSelect";
import { useQuery } from "@tanstack/react-query";
import { imagenames } from "@/commons/loader.ts";
import { buttonType, useColorsAndIconsForSections } from "@/components/colorsIconsForSections";
import { VermietungContext } from "@/components/vermietung/VermietungComp.tsx";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { fromFormObject } from "@/components/vermietung/vermietungCompUtils.ts";
import { PressePreview } from "@/components/vermietung/presse/PressePreview.tsx";

export default function PresseCard() {
  const mietContext = useContext(VermietungContext);
  const form = mietContext!.form;

  const allimages = useQuery({
    queryKey: ["imagenames"],
    queryFn: () => imagenames(),
  });

  const { color } = useColorsAndIconsForSections("presse");
  const [mietForPreview, setMietForPreview] = useState<Vermietung>(new Vermietung());
  const presseText = Form.useWatch(["presse", "text"]);
  const presseOriText = Form.useWatch(["presse", "originalText"]);
  const url = Form.useWatch(["presse", "jazzclubURL"]);
  const image = Form.useWatch(["presse", "image"]);
  const ok = Form.useWatch(["presse", "checked"]);

  const editorOptions = useMemo(
    () => ({
      status: false,
      spellChecker: false,
      sideBySideFullscreen: false,
      minHeight: "500px",
    }),
    [],
  );

  useEffect(() => {
    const vermietung = fromFormObject(form);
    setMietForPreview(vermietung);
  }, [presseText, url, image, ok, presseOriText]);

  function imageUebernehmen(val: string) {
    const name = ["presse", "image"];
    const imagelist = form.getFieldValue(name);
    form.setFieldValue(name, [...imagelist, val]);
    form.setFieldValue(["tempimage"], null);
  }

  const [activePage, setActivePage] = useState<string>("final");

  function TabLabel(props: { kind: string; title: string }) {
    const farbe = color();
    const active = activePage === props.kind;
    return (
      <b
        style={{
          margin: -16,
          padding: 16,
          backgroundColor: active ? farbe : "inherit",
          color: active ? "#FFF" : farbe,
        }}
      >
        {props.title}
      </b>
    );
  }

  return (
    <CollapsibleForVeranstaltung suffix="presse" label="Pressematerial" noTopBorder>
      <Row gutter={12}>
        <Col xs={24} lg={12}>
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
          <Uploader form={form} name={["presse", "image"]} typ={"pressefoto"} />
          <SingleSelect name={["tempimage"]} label={"Vorhandene Bilder übernehmen"} options={allimages.data} onChange={imageUebernehmen} />
        </Col>
        <Col xs={24} lg={12}>
          <PressePreview vermietung={mietForPreview} />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
