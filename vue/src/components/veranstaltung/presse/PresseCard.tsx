import React, { useEffect, useMemo, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Form, FormInstance, Row, Tabs } from "antd";
import { TextField } from "@/widgets/TextField";
import CheckItem from "@/widgets/CheckItem";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import Uploader from "@/components/veranstaltung/Uploader";
import SimpleMdeReact from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import SingleSelect from "@/widgets/SingleSelect";
import { useQuery } from "@tanstack/react-query";
import { imagenames } from "@/commons/loader.ts";
import { fromFormObject as fromFormObjectVeranstaltung } from "@/components/veranstaltung/veranstaltungCompUtils";
import { fromFormObject as fromFormObjectVermietung } from "@/components/vermietung/vermietungCompUtils";
import { useColorsAndIconsForSections } from "@/components/colorsIconsForSections";
import { PressePreview } from "@/components/veranstaltung/presse/PressePreview";
import Vermietung from "jc-shared/vermietung/vermietung.ts";

export default function PresseCard({ form, isVermietung }: { form: FormInstance; isVermietung: boolean }) {
  const allimages = useQuery({
    queryKey: ["imagenames"],
    queryFn: () => imagenames(),
  });

  const { color } = useColorsAndIconsForSections("presse");
  const [verForPreview, setVerForPreview] = useState<Veranstaltung | Vermietung>(isVermietung ? new Vermietung() : new Veranstaltung());

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
    if (isVermietung) {
      setVerForPreview(fromFormObjectVermietung(form));
    } else {
      setVerForPreview(fromFormObjectVeranstaltung(form));
    }
  }, [presseText, url, image, ok, presseOriText, isVermietung, form]);

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
          <PressePreview veranstVermiet={verForPreview} />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
