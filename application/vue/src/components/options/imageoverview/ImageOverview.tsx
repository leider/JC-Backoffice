import * as React from "react";
import { useEffect, useMemo } from "react";
import { Col, Form } from "antd";
import { SaveButton } from "@/components/colored/JazzButtons.tsx";
import { saveImagenames } from "@/rest/loader.ts";
import { ImageOverviewRow } from "jc-shared/konzert/konzert.ts";
import { Section } from "@/components/options/imageoverview/Section.tsx";
import { useCreateImagenamesSections } from "@/components/options/imageoverview/useCreateImagenamesSections.ts";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import filter from "lodash/filter";
import { JazzRow } from "@/widgets/JazzRow.tsx";

type ImageOverviewForm = { with: ImageOverviewRow[]; notFound: ImageOverviewRow[]; unused: ImageOverviewRow[] };

export default function ImageOverview() {
  useDirtyBlocker(false);
  const [form] = Form.useForm<ImageOverviewForm>();

  const mutateImages = useJazzMutation({
    saveFunction: saveImagenames,
    queryKey: "imagenames",
    successMessage: "Gespeichert",
  });

  document.title = "Bilder bearbeiten";
  const sections = useCreateImagenamesSections();

  const noPerSection = useMemo(() => {
    return { with: sections.with.length, notFound: sections.notFound.length, unused: sections.unused.length };
  }, [sections]);

  useEffect(() => {
    form.setFieldsValue(sections);
  }, [form, sections]);

  function saveForm() {
    const sects: ImageOverviewForm = form.getFieldsValue(true);
    const changedRows = filter(sects.with.concat(sects.notFound).concat(sects.unused), (v) => v.newname !== v.image);
    form.validateFields().then(async () => {
      mutateImages.mutate(changedRows);
    });
  }

  return (
    <Form form={form} onFinish={saveForm}>
      <JazzPageHeader buttons={[<SaveButton key="save" />]} title="Bilder bearbeiten" />
      <JazzRow>
        <Col span={24}>
          <Section noOfImages={noPerSection.with} prefix="with" title="Bilder ohne Probleme" />
          <Section noOfImages={noPerSection.unused} prefix="unused" title="Unbenutzte Bilder" />
          <Section noOfImages={noPerSection.notFound} prefix="notFound" title="Nicht gefundene Bilder" />
        </Col>
      </JazzRow>
    </Form>
  );
}
