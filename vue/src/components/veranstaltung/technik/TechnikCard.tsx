import OptionValues from "jc-shared/optionen/optionValues";
import React, { useEffect, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Button, Col, FormInstance, Row, Upload, UploadFile, UploadProps } from "antd";
import { TextField } from "@/widgets-react/TextField";
import { NumberInput } from "@/widgets-react/numericInputWidgets";
import CheckItem from "@/widgets-react/CheckItem";
import MultiSelectWithTags from "@/widgets-react/MultiSelectWithTags";
import { uploadFile } from "@/commons/loader-for-react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { IconForSmallBlock } from "@/components/Icon";
import { RcFile } from "antd/es/upload";
import Kosten from "jc-shared/veranstaltung/kosten";

export default function TechnikCard(props: { form: FormInstance<Veranstaltung>; optionen: OptionValues; veranstaltung: Veranstaltung }) {
  async function saveFiles() {
    setUploading(true);
    const formData = new FormData();
    formData.append("id", props.veranstaltung.id || "");
    formData.append("typ", "rider");
    fileList.forEach((file) => {
      formData.append("datei", file as RcFile, file.name);
    });
    try {
      const newVeranstaltung = await uploadFile(formData);
      setFileList([]);
      const strings = newVeranstaltung.technik.dateirider;
      props.form.setFieldsValue({ technik: { dateirider: strings } });
    } catch (e) {
      console.error("Oops");
    } finally {
      setUploading(false);
    }
  }

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const uploadprops: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  const [summe, setSumme] = useState<number>(0);
  useEffect(() => {
    setSumme(props.veranstaltung.kosten.backlineUndTechnikEUR);
  }, [props.veranstaltung]);

  function updateSumme() {
    const kosten: Kosten = new Kosten(props.form.getFieldValue("kosten"));
    setSumme(kosten.backlineUndTechnikEUR);
  }

  return (
    <CollapsibleForVeranstaltung suffix="technik" label="Rider und Backline" noTopBorder amount={summe}>
      <Row gutter={12}>
        <Col span={8}>
          <CheckItem name={["technik", "checked"]} label="Technik ist geklärt" />
        </Col>
        <Col span={8}>
          <CheckItem name={["technik", "fluegel"]} label="Flügel stimmen" />
        </Col>
      </Row>
      <Row gutter={12} align="bottom" style={{ marginBottom: 24 }}>
        <Col span={12}>
          <MultiSelectWithTags
            name={["technik", "dateirider"]}
            label="Rider"
            options={props.veranstaltung.technik.dateirider}
            style={{ marginBottom: "0" }}
          />
        </Col>
        <Col span={6}>
          <Upload {...uploadprops}>
            <Button icon={<IconForSmallBlock iconName="Upload" />}> &nbsp; Neue auswählen (mehrere möglich)</Button>
          </Upload>
        </Col>
        <Col span={6}>
          <Button type="primary" onClick={saveFiles} disabled={fileList.length === 0} loading={uploading}>
            {uploading ? "Lädt..." : "Ausgewählte hochladen"}
          </Button>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={16}>
          <MultiSelectWithTags name={["technik", "backlineJazzclub"]} label="Backline Jazzclub" options={props.optionen.backlineJazzclub} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={16}>
          <MultiSelectWithTags name={["technik", "backlineRockshop"]} label="Backline Rockshop" options={props.optionen.backlineRockshop} />
        </Col>
        <Col span={8}>
          <NumberInput name={["kosten", "backlineEUR"]} label="Betrag" decimals={2} suffix="€" onChange={updateSumme} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={16}>
          <TextField name={["technik", "technikAngebot1"]} label="Technik Zumietung" />
        </Col>
        <Col span={8}>
          <NumberInput name={["kosten", "technikAngebot1EUR"]} label="Betrag" decimals={2} suffix="€" onChange={updateSumme} />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
