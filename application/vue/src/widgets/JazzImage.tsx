import { Image, Space } from "antd";
import React, { useCallback } from "react";
import type { ToolbarRenderInfoType } from "rc-image/lib/Preview";
import ButtonForImagePreview from "@/components/veranstaltung/presse/ButtonForImagePreview.tsx";
import { imgFullsize } from "@/rest/loader.ts";

function PreviewToolbar({
  actions: { onZoomOut, onZoomIn },
  image: { url },
  transform: { scale },
}: Omit<ToolbarRenderInfoType, "current" | "total">) {
  const download = useCallback(() => imgFullsize(url.replace("/upload/", "")), [url]);
  return (
    <Space className="toolbar-wrapper" size={12}>
      <ButtonForImagePreview icon="Download" onClick={download} />
      <ButtonForImagePreview disabled={scale === 1} icon="ZoomOut" onClick={onZoomOut} />
      <ButtonForImagePreview disabled={scale === 50} icon="ZoomIn" onClick={onZoomIn} />
    </Space>
  );
}

export default function JazzImage({ img, width }: { readonly img: string; readonly width: string }) {
  const toolbarRender = useCallback<
    (originalNode: React.ReactElement, info: Omit<ToolbarRenderInfoType, "current" | "total">) => React.ReactNode
  >(
    (_, { image, transform, actions, icons }) => <PreviewToolbar actions={actions} icons={icons} image={image} transform={transform} />,
    [],
  );

  return (
    <Image
      key={img}
      preview={{
        src: `/upload/${img}`,
        toolbarRender,
      }}
      src={`/imagepreview/${img}`}
      width={width}
    />
  );
}
