import * as React from "react";
import { useEffect, useMemo } from "react";
import { Col, Form } from "antd";
import { SaveButton } from "@/components/colored/JazzButtons.tsx";
import { saveImagenames } from "@/commons/loader.ts";
import { ImageOverviewRow } from "jc-shared/konzert/konzert.ts";
import { Section } from "@/components/options/imageoverview/Section.tsx";
import { useCreateImagenamesSections } from "@/components/options/imageoverview/useCreateImagenamesSections.ts";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import filter from "lodash/filter";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function ImageOverview() {
  useDirtyBlocker(false);
  const [form] = Form.useForm<{
    with: ImageOverviewRow[];
    notFound: ImageOverviewRow[];
    unused: ImageOverviewRow[];
  }>();

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
    const formValues = form.getFieldsValue(true);
    const changedRows = filter(formValues.with, (v: ImageOverviewRow) => v.newname !== v.image)
      .concat(filter(formValues.notFound, (v: ImageOverviewRow) => v.newname !== v.image))
      .concat(filter(formValues.unused, (v: ImageOverviewRow) => v.newname !== v.image));
    form.validateFields().then(async () => {
      mutateImages.mutate(changedRows);
    });
  }

  return (
    <Form form={form} onFinish={saveForm}>
      <JazzPageHeader title="Bilder bearbeiten" buttons={[<SaveButton key="save" />]} />
      <JazzRow>
        <Col span={24}>
          <Section prefix="with" title="Bilder ohne Probleme" noOfImages={noPerSection.with} />
          <Section prefix="unused" title="Unbenutzte Bilder" noOfImages={noPerSection.unused} />
          <Section prefix="notFound" title="Nicht gefundene Bilder" noOfImages={noPerSection.notFound} />
        </Col>
      </JazzRow>
    </Form>
  );
}
