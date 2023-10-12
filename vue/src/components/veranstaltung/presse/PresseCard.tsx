import React, { useEffect, useMemo, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Button, Col, Form, FormInstance, Row, Tabs } from "antd";
import { TextField } from "@/widgets/TextField";
import CheckItem from "@/widgets/CheckItem";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import Uploader from "@/components/veranstaltung/Uploader";
import SimpleMdeReact from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import SingleSelect from "@/widgets/SingleSelect";
import { useQuery } from "@tanstack/react-query";
import { imagenames } from "@/commons/loader.ts";
import { fromFormObject } from "@/components/veranstaltung/veranstaltungCompUtils";
import { buttonType, useColorsAndIconsForSections } from "@/components/colorsIconsForSections";
import { PressePreview } from "@/components/veranstaltung/presse/PressePreview";
import { IconForSmallBlock } from "@/components/Icon.tsx";

export default function PresseCard({ form, id }: { id?: string; form: FormInstance<Veranstaltung> }) {
  const allimages = useQuery({
    queryKey: ["imagenames"],
    queryFn: () => imagenames(),
  });

  const { color } = useColorsAndIconsForSections("presse");
  const [veranstForPreview, setVeranstForPreview] = useState<Veranstaltung>(new Veranstaltung());
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
    const veranst = fromFormObject(form);
    setVeranstForPreview(veranst);
    //updatePreview(veranst);
  }, [presseText, url, image, ok, presseOriText]);

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
                label: <TabLabel kind="allgemeines" title="Finaler Text" />,
                children: (
                  <Form.Item label={<b>Formatierter Text für die Pressemitteilung:</b>} name={["presse", "text"]}>
                    <SimpleMdeReact autoFocus options={editorOptions} />
                  </Form.Item>
                ),
              },
              {
                key: "original",
                label: <TabLabel kind="allgemeines" title="Originaler Text" />,
                children: (
                  <Form.Item label={<b>Formatierter Text für die Pressemitteilung:</b>} name={["presse", "originalText"]}>
                    <SimpleMdeReact autoFocus options={editorOptions} />
                  </Form.Item>
                ),
              },
            ]}
          />
          <Uploader form={form} id={id} name={["presse", "image"]} typ={"pressefoto"} />
          <SingleSelect name={["tempimage"]} label={"Vorhandene Bilder übernehmen"} options={allimages.data} onChange={imageUebernehmen} />
        </Col>
        <Col xs={24} lg={12}>
          <a href={`/imgzipForVeranstaltung/${veranstForPreview.url}`}>
            <Button icon={<IconForSmallBlock size={16} iconName={"Download"} />}>Originalbilder als ZIP</Button>
          </a>
          <PressePreview veranstaltung={veranstForPreview} />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
