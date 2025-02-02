import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import SingleSelect from "@/widgets/SingleSelect.tsx";
import { Button, Col, Form } from "antd";
import { useQuery } from "@tanstack/react-query";
import { historyIdsFor } from "@/commons/loader.ts";
import React, { useEffect, useMemo, useState } from "react";
import { Changelog } from "@/components/history/Changelog.tsx";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import { useWatch } from "antd/es/form/Form";
import map from "lodash/map";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { useSearchParams } from "react-router";
import find from "lodash/find";

export function History() {
  const [form] = Form.useForm();
  const [search, setSearch] = useSearchParams();
  const [expanded, setExpanded] = useState(false);

  const collection = useWatch(["collection"], {
    form,
    preserve: true,
  });

  const id: string = useWatch(["id"], {
    form,
    preserve: true,
  });

  useEffect(() => {
    const coll = search.get("collection");
    if (coll !== collection) {
      form.setFieldsValue({ collection: coll });
    }
  }, [collection, form, search]);

  const { data: historyIds } = useQuery({
    enabled: !!collection,
    queryKey: ["history", collection],
    queryFn: () => historyIdsFor(collection),
  });

  const displayIds = useMemo(() => {
    return map(historyIds, (histId) => `${histId.id} (${histId.state} ${DatumUhrzeit.forISOString(histId.time).tagMonatJahrKompakt})`);
  }, [historyIds]);

  useEffect(() => {
    const idFromSearch = search.get("id");
    const theEntry = find(historyIds, { id: idFromSearch }) as { id: string; state: string; time: string };
    if (theEntry) {
      form.setFieldValue("id", `${theEntry.id} (${theEntry.state} ${DatumUhrzeit.forISOString(theEntry.time).tagMonatJahrKompakt})`);
    } else {
      form.setFieldValue("id", "");
    }
  }, [form, historyIds, search]);

  const realId = useMemo(() => {
    return id ? id.split(" (ge")[0] : "";
  }, [id]);

  return (
    <Form form={form} autoComplete="off">
      <JazzPageHeader
        title="Änderungsverlauf"
        buttons={[
          <Button
            key="edit"
            icon={<IconForSmallBlock iconName="FileEarmarkText" />}
            type="primary"
            onClick={() => setExpanded(!expanded)}
            disabled={!id}
          >
            {expanded ? "Alle zuklappen" : "Alle aufklappen"}
          </Button>,
        ]}
      />
      <RowWrapper>
        <JazzRow>
          <Col xs={24} lg={8}>
            <SingleSelect
              name="collection"
              label="Tabelle"
              options={["Veranstaltung", "Vermietung", "Programmheft", "Termine", "Mailregeln", "Optionen", "User", "Rider"]}
              onChange={(value) => setSearch({ collection: value })}
            />
          </Col>
          <Col xs={24} lg={16}>
            <SingleSelect
              name="id"
              label="ID"
              options={displayIds ?? []}
              onChange={(value) => setSearch({ collection: search.get("collection") ?? "", id: value ? value.split(" (ge")[0] : "" })}
            />
          </Col>
        </JazzRow>
        <JazzRow>
          <Col span={24}>
            <Changelog collection={collection} id={realId} expanded={expanded} />
          </Col>
        </JazzRow>
      </RowWrapper>
    </Form>
  );
}
