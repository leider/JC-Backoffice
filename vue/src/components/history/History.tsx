import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import SingleSelect from "@/widgets/SingleSelect.tsx";
import { Col, Form, Row } from "antd";
import { useQuery } from "@tanstack/react-query";
import { historyIdsFor, historyRowsFor } from "@/commons/loader.ts";
import React, { useEffect, useMemo } from "react";
import { differenceForAsObject } from "jc-shared/commons/comparingAndTransforming.ts";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import JsonView from "@uiw/react-json-view";

export function History() {
  const [form] = Form.useForm();

  const collection = Form.useWatch(["collection"], {
    form,
    preserve: true,
  });

  const id = Form.useWatch(["id"], {
    form,
    preserve: true,
  });

  const { data: historyIds } = useQuery({
    enabled: !!collection,
    queryKey: ["history", collection],
    queryFn: () => historyIdsFor(collection),
  });
  const { data: rows } = useQuery({ enabled: !!id, queryKey: ["history", collection, id], queryFn: () => historyRowsFor(collection, id) });
  useEffect(() => {
    const id = form.getFieldValue("id");
    if (!(historyIds || []).includes(id)) {
      form.setFieldValue("id", "");
    }
  }, [form, historyIds]);

  const changelog = useMemo(() => {
    const changelogObject: { [idx: string]: object } = {};
    (rows || []).forEach((row) => {
      const result: {
        user: string;
        time: string;
        before: { id?: string; changelist?: object };
        after: { id?: string; changelist?: object };
      } = {
        before: {},
        after: {},
        user: "",
        time: "",
      };
      Object.assign(result, row, {
        before: JSON.parse(row.before),
        after: JSON.parse(row.after),
        time: DatumUhrzeit.forISOString(row.time).toLocalDateTimeString,
      });
      delete result.before.changelist;
      delete result.after.changelist;
      const header = result.user + " " + result.time;
      if (!result.before.id && result.after.id) {
        changelogObject[`NEUANLAGE - ${header}`] = differenceForAsObject(result.before, result.after);
      } else if (result.before.id && Object.keys(result.after).length === 1) {
        changelogObject[`GELÖSCHT - ${header}`] = {};
      } else {
        changelogObject[header] = differenceForAsObject(result.before, result.after);
      }
    });
    return changelogObject;
  }, [rows]);

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
          <Col xs={24} lg={8}>
            <SingleSelect name="id" label="ID" options={historyIds || []} />
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={24}>
            <JsonView value={changelog} displayDataTypes={false} displayObjectSize={false} enableClipboard={false} />
          </Col>
        </Row>
      </RowWrapper>
    </Form>
  );
}
