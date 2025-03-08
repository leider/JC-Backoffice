import React, { useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Tabs } from "antd";
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
import { MarkdownEditor } from "@/widgets/markdown/MarkdownEditor.tsx";
import Konzert from "jc-shared/konzert/konzert.ts";
import { useWatch } from "antd/es/form/Form";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { JazzRow } from "@/widgets/JazzRow";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

export default function PresseCard({ isVermietung }: { isVermietung: boolean }) {
  const form = useFormInstance();
  const allimages = useQuery({ queryKey: ["imagenames"], queryFn: () => imagenames() });

  const { color } = colorsAndIconsForSections;
  const [verForPreview, setVerForPreview] = useState<Konzert | Vermietung>(isVermietung ? new Vermietung() : new Konzert());

  const presseText = useWatch(["presse", "text"]);
  const presseOriText = useWatch(["presse", "originalText"]);
  const url = useWatch(["presse", "jazzclubURL"]);
  const image = useWatch(["presse", "image"]);
  const ok = useWatch(["presse", "checked"]);

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
    const { brightText } = useJazzContext();
    const farbe = color("presse");
    const active = activePage === props.kind;
    return (
      <b
        style={{
          margin: -16,
          padding: 16,
          backgroundColor: active ? farbe : "inherit",
          color: active ? brightText : farbe,
        }}
      >
        {props.title}
      </b>
    );
  }

  return (
    <Collapsible label="Pressematerial" noTopBorder suffix="presse">
      <JazzRow>
        <Col lg={12} xs={24}>
          <CheckItem label="Ist so OK" name={["presse", "checked"]} />
          <TextField label="URL-Suffix bei jazzclub.de" name={["presse", "jazzclubURL"]} />
          <Tabs
            activeKey={activePage}
            items={[
              {
                key: "final",
                label: <TabLabel kind="final" title="Finaler Text" />,
                children: <MarkdownEditor label={<b>Formatierter Text für die Pressemitteilung:</b>} name={["presse", "text"]} />,
              },
              {
                key: "original",
                label: <TabLabel kind="original" title="Originaler Text" />,
                children: <MarkdownEditor label={<b>Formatierter Text für die Pressemitteilung:</b>} name={["presse", "originalText"]} />,
              },
            ]}
            onChange={setActivePage}
            type="card"
          />
          <Uploader name={["presse", "image"]} onlyImages typ="pressefoto" />
          <SingleSelect
            label="Vorhandene Bilder übernehmen"
            name={["tempimage"]}
            onChange={imageUebernehmen}
            options={allimages.data || []}
          />
        </Col>
        <Col lg={12} xs={24}>
          <PressePreview veranstaltung={verForPreview} />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
