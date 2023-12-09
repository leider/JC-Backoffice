import type { FC } from "react";
import React, { useState } from "react";
import { BoxParams } from "@/components/rider/types.ts";
import { PageHeader } from "@ant-design/pro-layout";
import { ExportRiderButton, ImportRiderButton } from "@/components/rider/ExportImport.tsx";
import { RiderComp } from "@/components/rider/RiderComp.tsx";

export const RiderStandalone: FC = () => {
  const [targetBoxes, setTargetBoxes] = useState<BoxParams[]>([]);

  return (
    <>
      <PageHeader
        title="Rider"
        extra={[<ExportRiderButton key="export" boxes={targetBoxes} />, <ImportRiderButton key="import" setTargetBoxes={setTargetBoxes} />]}
      />
      <RiderComp targetBoxes={targetBoxes} setTargetBoxes={setTargetBoxes} />
    </>
  );
};
