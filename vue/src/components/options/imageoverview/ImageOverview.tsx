import * as React from "react";
import { useEffect, useMemo } from "react";
import { Col, Form, Row } from "antd";
import { SaveButton } from "@/components/colored/JazzButtons.tsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveImagenames } from "@/commons/loader.ts";
import { ImageOverviewRow } from "jc-shared/veranstaltung/veranstaltung.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { Section } from "@/components/options/imageoverview/Section.tsx";
import { useCreateImagenamesSections } from "@/components/options/imageoverview/useCreateImagenamesSections.ts";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";

export default function ImageOverview() {
  useDirtyBlocker(false);
  const { showSuccess } = useJazzContext();
  const [form] = Form.useForm<{
    with: ImageOverviewRow[];
    notFound: ImageOverviewRow[];
    unused: ImageOverviewRow[];
  }>();
  const queryClient = useQueryClient();

  const mutateImages = useMutation({
    mutationFn: saveImagenames,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imagenames"] });
      showSuccess({});
    },
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
    const changedRows = formValues.with
      .filter((v: ImageOverviewRow) => v.newname !== v.image)
      .concat(formValues.notFound.filter((v: ImageOverviewRow) => v.newname !== v.image))
      .concat(formValues.unused.filter((v: ImageOverviewRow) => v.newname !== v.image));
    form.validateFields().then(async () => {
      mutateImages.mutate(changedRows);
    });
  }

  return (
    <Form form={form} onFinish={saveForm}>
      <JazzPageHeader title="Bilder bearbeiten" buttons={[<SaveButton key="save" />]} />
      <Row gutter={12}>
        <Col span={24}>
          <Section prefix="with" title="Bilder ohne Probleme" noOfImages={noPerSection.with} />
          <Section prefix="unused" title="Unbenutzte Bilder" noOfImages={noPerSection.unused} />
          <Section prefix="notFound" title="Nicht gefundene Bilder" noOfImages={noPerSection.notFound} />
        </Col>
      </Row>
    </Form>
  );
}
