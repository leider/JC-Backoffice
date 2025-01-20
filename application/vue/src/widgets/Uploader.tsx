import { Col, Popover, Row, Space, Tag, Upload, UploadFile, UploadProps } from "antd";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags.tsx";
import React, { useCallback, useEffect, useState } from "react";
import { RcFile } from "antd/es/upload";
import { uploadFile } from "@/commons/loader.ts";
import { CustomTagProps } from "rc-select/lib/BaseSelect";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import forEach from "lodash/forEach";
import { KonzertFileUploadType } from "jc-shared/konzert/konzert.ts";
import { useWatch } from "antd/es/form/Form";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

interface UploaderParams {
  name: string[];
  typ: KonzertFileUploadType;
  onlyImages?: boolean;
}

const maxFileSize = 20971520; // 20 MB

export default function Uploader({ name, typ, onlyImages = false }: UploaderParams) {
  const form = useFormInstance();
  const { showError } = useJazzContext();
  const [options, setOptions] = useState<string[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const id = useWatch("id", { form, preserve: true });
  const filenames = useWatch("name", { form, preserve: true });

  useEffect(() => setOptions(filenames ?? []), [filenames, form]);

  const saveFiles = useCallback(async () => {
    setUploading(true);
    const formData = new FormData();
    formData.append("id", form.getFieldValue("id"));
    formData.append("typ", typ);
    forEach(fileList, (file) => {
      formData.append("datei", file as RcFile, file.name);
    });
    try {
      const newVeranstaltung = await uploadFile(formData);
      setFileList([]);
      const strings = name.reduce((prev, curr) => prev[curr], newVeranstaltung);
      form.setFieldValue(name, strings);
    } catch {
      // eslint-disable-next-line no-console
      console.error("Oops");
    } finally {
      setUploading(false);
    }
  }, [fileList, form, name, typ]);

  const uploadprops: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      if (file.size > maxFileSize) {
        showError({ title: "Datei zu groß", text: "Die Datei darf maximal 20 Megabyte groß sein" });
        return false;
      }
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  const tagRender = (props: CustomTagProps) => {
    const content =
      typ === "pressefoto" ? (
        <img src={`/imagepreview/${props.label}`} alt={props.label as string} width="100%" />
      ) : (
        <a href={`/files/${props.label}`}>{props.label} </a>
      );
    return (
      <Popover content={content} title={typ === "pressefoto" ? "Vorschau" : "Klick zur Ansicht / Download"}>
        <Tag closable={props.closable} onClose={props.onClose}>
          {props.label}
        </Tag>
      </Popover>
    );
  };

  return (
    id && (
      <Row>
        <Col>
          <Space align="end">
            <MultiSelectWithTags name={name} label="Dateien" options={options} style={{ marginBottom: 0 }} specialTagRender={tagRender} />
            <Upload {...uploadprops} accept={onlyImages ? "image/*" : undefined}>
              <ButtonWithIcon icon="FileEarmarkPlus" text="Auswählen" type="default" />
            </Upload>
            <ButtonWithIcon
              text={uploading ? "Lädt..." : "Hochladen"}
              icon="Upload"
              onClick={saveFiles}
              disabled={fileList.length === 0}
              loading={uploading}
            />
          </Space>
        </Col>
      </Row>
    )
  );
}
