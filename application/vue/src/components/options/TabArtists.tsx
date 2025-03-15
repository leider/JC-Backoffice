import * as React from "react";
import { Col } from "antd";
import Collapsible from "@/widgets/Collapsible.tsx";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import OptionValues from "jc-shared/optionen/optionValues.ts";
import { useMemo } from "react";

export default function TabArtists() {
  const form = useFormInstance<OptionValues>();
  const optionen = useMemo(() => form.getFieldsValue(true), [form]);

  return (
    <JazzRow>
      <Col span={24}>
        <Collapsible label="Künstler" noTopBorder suffix="allgemeines">
          <MultiSelectWithTags label="Künstler" name="artists" options={optionen?.artists ?? []} />
        </Collapsible>
      </Col>
    </JazzRow>
  );
}
