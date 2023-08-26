import { Button, Col, FormInstance, Row, Space, Tag, Upload, UploadFile, UploadProps } from "antd";
import MultiSelectWithTags from "@/widgets-react/MultiSelectWithTags";
import { IconForSmallBlock } from "@/components/Icon";
import React, { useEffect, useState } from "react";
import { RcFile } from "antd/es/upload";
import { uploadFile } from "@/commons/loader-for-react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";

interface UoloaderParams {
  form: FormInstance<Veranstaltung>;
  veranstaltung: Veranstaltung;
  name: string[];
  typ: string;
}

export default function Uploader({ form, veranstaltung, name, typ }: UoloaderParams) {
  const [options, setOptions] = useState<string[]>([]);
  useEffect(() => {
    setOptions(form.getFieldValue(name));
  }, [veranstaltung, form]);
  async function saveFiles() {
    setUploading(true);
    const formData = new FormData();
    formData.append("id", veranstaltung.id || "");
    formData.append("typ", typ);
    fileList.forEach((file) => {
      formData.append("datei", file as RcFile, file.name);
    });
    try {
      const newVeranstaltung = await uploadFile(formData);
      setFileList([]);
      const strings = name.reduce((prev, curr) => prev[curr], newVeranstaltung);
      form.setFieldValue(name, strings);
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
    <>
      <Row>
        <Col>
          <Space align="end">
            <MultiSelectWithTags name={name} label="Dateien" options={options} style={{ marginBottom: "0" }} />
            <Upload {...uploadprops}>
              <Button icon={<IconForSmallBlock iconName="FileEarmarkPlus" />}> &nbsp; Auswählen</Button>
            </Upload>
            <Button
              icon={<IconForSmallBlock iconName="Upload" />}
              type="primary"
              onClick={saveFiles}
              disabled={fileList.length === 0}
              loading={uploading}
            >
              &nbsp; {uploading ? "Lädt..." : "Hochladen"}
            </Button>
          </Space>
        </Col>
      </Row>
      <Row style={{ marginTop: 16 }}>
        <Col>
          <b>Preview: </b>
          {(options ?? []).map((opt) => (
            <Tag key={opt} color="orange">
              <a href={`/files/${opt}`}>{opt} </a>
            </Tag>
          ))}
        </Col>
      </Row>
    </>
  );
}
