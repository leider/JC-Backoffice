import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import SingleSelect from "@/widgets/SingleSelect.tsx";
import { Col, Form, Row } from "antd";
import { useQuery } from "@tanstack/react-query";
import { historyIdsFor } from "@/commons/loader.ts";
import React, { useEffect, useMemo } from "react";
import { Changelog } from "@/components/history/Changelog.tsx";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";

export function History() {
  const [form] = Form.useForm();

  const collection = Form.useWatch(["collection"], {
    form,
    preserve: true,
  });

  const id: string = Form.useWatch(["id"], {
    form,
    preserve: true,
  });

  const { data: historyIds } = useQuery({
    enabled: !!collection,
    queryKey: ["history", collection],
    queryFn: () => historyIdsFor(collection),
  });

  const displayIds = useMemo(() => {
    return historyIds?.map((histId) => `${histId.id} (${histId.state} ${DatumUhrzeit.forISOString(histId.time).tagMonatJahrKompakt})`);
  }, [historyIds]);

  useEffect(() => {
    const id = form.getFieldValue("id");
    if ((historyIds || []).length === 0 && !(historyIds || []).includes(id)) {
      form.setFieldValue("id", "");
    } else {
      const histId = historyIds?.[0] || { id: "", state: "", time: "" };
      form.setFieldValue("id", `${histId.id} (${histId.state} ${DatumUhrzeit.forISOString(histId.time).tagMonatJahrKompakt})`);
    }
  }, [form, historyIds]);

  const realId = useMemo(() => {
    return id ? id.split(" (ge")[0] : "";
  }, [id]);

  return (
    <Form form={form} autoComplete="off">
      <JazzPageHeader title="Änderungsverlauf" />
      <RowWrapper>
        <Row gutter={12}>
          <Col xs={24} lg={8}>
            <SingleSelect
              name="collection"
              label="Tabelle"
              options={["Veranstaltung", "Vermietung", "Programmheft", "Termine", "Mailregeln", "Optionen", "User"]}
            />
          </Col>
          <Col xs={24} lg={16}>
            <SingleSelect name="id" label="ID" options={displayIds || []} />
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={24}>
            <Changelog collection={collection} id={realId} />
          </Col>
        </Row>
      </RowWrapper>
    </Form>
  );
}
