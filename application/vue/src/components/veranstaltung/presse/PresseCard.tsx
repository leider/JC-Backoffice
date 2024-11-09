import React, { useEffect, useMemo, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, FormInstance, Row, Tabs } from "antd";
import { TextField } from "@/widgets/TextField.tsx";
import CheckItem from "@/widgets/CheckItem.tsx";
import Uploader from "@/widgets/Uploader.tsx";
import "easymde/dist/easymde.min.css";
import SingleSelect from "@/widgets/SingleSelect.tsx";
import { useQuery } from "@tanstack/react-query";
import { imagenames } from "@/commons/loader.ts";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { PressePreview } from "@/components/veranstaltung/presse/PressePreview.tsx";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { MarkdownEditor } from "@/widgets/MarkdownEditor.tsx";
import Konzert from "jc-shared/konzert/konzert.ts";
import { useWatch } from "antd/es/form/Form";

export default function PresseCard({ form, isVermietung }: { form: FormInstance; isVermietung: boolean }) {
  const allimages = useQuery({
    queryKey: ["imagenames"],
    queryFn: () => imagenames(),
  });

  const { color } = colorsAndIconsForSections;
  const [verForPreview, setVerForPreview] = useState<Konzert | Vermietung>(isVermietung ? new Vermietung() : new Konzert());

  const presseText = useWatch(["presse", "text"]);
  const presseOriText = useWatch(["presse", "originalText"]);
  const url = useWatch(["presse", "jazzclubURL"]);
  const image = useWatch(["presse", "image"]);
  const ok = useWatch(["presse", "checked"]);

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
      setVerForPreview(new Vermietung(form.getFieldsValue(true)));
    } else {
      setVerForPreview(new Konzert(form.getFieldsValue(true)));
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
    const farbe = color("presse");
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
    <Collapsible suffix="presse" label="Pressematerial" noTopBorder>
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
                  <MarkdownEditor
                    label={<b>Formatierter Text für die Pressemitteilung:</b>}
                    name={["presse", "text"]}
                    options={editorOptions}
                  />
                ),
              },
              {
                key: "original",
                label: <TabLabel kind="original" title="Originaler Text" />,
                children: (
                  <MarkdownEditor
                    label={<b>Formatierter Text für die Pressemitteilung:</b>}
                    name={["presse", "originalText"]}
                    options={editorOptions}
                  />
                ),
              },
            ]}
          />
          <Uploader form={form} name={["presse", "image"]} typ={"pressefoto"} />
          <SingleSelect
            name={["tempimage"]}
            label={"Vorhandene Bilder übernehmen"}
            options={allimages.data || []}
            onChange={imageUebernehmen}
          />
        </Col>
        <Col xs={24} lg={12}>
          <PressePreview veranstaltung={verForPreview} />
        </Col>
      </Row>
    </Collapsible>
  );
}
