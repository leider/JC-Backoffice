import React, { useEffect, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Button, Col, Form, FormInstance, Row, Select, Upload, UploadFile, UploadProps } from "antd";
import "easymde/dist/easymde.min.css";
import SingleSelect from "@/widgets-react/SingleSelect";
import Vertrag from "jc-shared/veranstaltung/vertrag";
import { DynamicItem } from "@/widgets-react/DynamicItem";
import { useAuth } from "@/commons/auth";
import { openVertrag, uploadFile } from "@/commons/loader-for-react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import MultiSelectWithTags from "@/widgets-react/MultiSelectWithTags";
import { IconForSmallBlock } from "@/components/Icon";
import { RcFile } from "antd/es/upload";

export default function VertragCard(props: { form: FormInstance<Veranstaltung>; veranstaltung: Veranstaltung }) {
  const { context } = useAuth();

  const [isBookingTeam, setIsBookingTeam] = useState<boolean>(false);
  useEffect(() => {
    setIsBookingTeam(!!context?.currentUser.accessrights?.isBookingTeam);
  }, [context]);

  async function saveFiles() {
    setUploading(true);
    const formData = new FormData();
    formData.append("id", props.veranstaltung.id || "");
    formData.append("typ", "vertrag");
    fileList.forEach((file) => {
      formData.append("datei", file as RcFile, file.name);
    });
    try {
      const newVeranstaltung = await uploadFile(formData);
      setFileList([]);
      const strings = newVeranstaltung.vertrag.datei;
      props.form.setFieldsValue({ vertrag: { datei: strings } });
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

  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Vertrag">
      <Row gutter={12}>
        <Col span={9}>
          <SingleSelect name={["vertrag", "art"]} label="Art" options={Vertrag.arten()} />
        </Col>
        <Col span={9}>
          <Form.Item label={<b>Sprache:</b>} name={["vertrag", "sprache"]}>
            <Select options={Vertrag.sprachen().map((s) => ({ label: s, value: s }))} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <DynamicItem
            nameOfDepending={"id"}
            renderWidget={(getFieldValue) => {
              return (
                <Form.Item label="&nbsp;">
                  <Button
                    block
                    type="primary"
                    disabled={!isBookingTeam || !getFieldValue("id")}
                    onClick={() => openVertrag(props.form.getFieldsValue(true))}
                  >
                    Generieren
                  </Button>
                </Form.Item>
              );
            }}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={24}>
          <MultiSelectWithTags
            name={["vertrag", "datei"]}
            label="Rider"
            options={props.veranstaltung.vertrag.datei}
            style={{ marginBottom: "0" }}
          />
        </Col>
      </Row>
      <Row gutter={12} align="top" style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Upload {...uploadprops}>
            <Button icon={<IconForSmallBlock iconName="Upload" />}> &nbsp; Neue auswählen (mehrere möglich)</Button>
          </Upload>
        </Col>
        <Col span={12}>
          <Button type="primary" onClick={saveFiles} disabled={fileList.length === 0} loading={uploading}>
            {uploading ? "Lädt..." : "Ausgewählte hochladen"}
          </Button>
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
