import { Space, theme, UploadFile, UploadProps } from "antd";
import React from "react";
import Dragger from "antd/lib/upload/Dragger";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import find from "lodash/find";

interface UploaderParams {
  fileList: UploadFile[];
  setFileList: (value: ((prevState: UploadFile[]) => UploadFile[]) | UploadFile[]) => void;
}

export default function UploaderForMail({ fileList, setFileList }: UploaderParams) {
  const { token } = theme.useToken();

  const uploadprops: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      if (!find(fileList, { name: file.name })) {
        setFileList((prev) => [...prev, file]);
      }
      return false;
    },
    fileList,
    multiple: true,
  };

  return (
    <Space>
      <Dragger {...uploadprops}>
        <p className="ant-upload-drag-icon" style={{ color: token.colorText }}>
          <IconForSmallBlock iconName="Upload" />
        </p>
        <p className="ant-upload-text" style={{ color: token.colorText }}>
          Hier klicken oder ziehen für einen Anhang
        </p>
        <p className="ant-upload-hint" style={{ color: token.colorText }}>
          Eine oder mehrere Dateien möglich.
        </p>
      </Dragger>
    </Space>
  );
}
