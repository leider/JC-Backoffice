import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import SingleSelect from "@/widgets/SingleSelect.tsx";
import { Button, Col, Form } from "antd";
import { useQuery } from "@tanstack/react-query";
import { historyIdsFor } from "@/rest/loader.ts";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Changelog } from "@/components/history/Changelog.tsx";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import { useWatch } from "antd/es/form/Form";
import map from "lodash/map";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { useSearchParams } from "react-router";
import find from "lodash/find";

export default function History() {
  const [form] = Form.useForm<{ collection: string; id: string }>();
  const [search, setSearch] = useSearchParams();
  const [expanded, setExpanded] = useState(false);

  const collection = useWatch("collection", { form, preserve: true });
  const id = useWatch("id", { form, preserve: true });

  useEffect(() => {
    const coll = search.get("collection");
    if (coll !== collection) {
      form.setFieldsValue({ collection: coll ?? "" });
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

  const expandUnexpand = useCallback(() => setExpanded(!expanded), [expanded]);
  const selectCollection = useCallback((value: string) => setSearch({ collection: value }), [setSearch]);
  const selectId = useCallback(
    (value: string) => setSearch({ collection: search.get("collection") ?? "", id: value ? value.split(" (ge")[0] : "" }),
    [search, setSearch],
  );
  return (
    <Form autoComplete="off" form={form}>
      <JazzPageHeader
        buttons={[
          <Button disabled={!id} icon={<IconForSmallBlock iconName="FileEarmarkText" />} key="edit" onClick={expandUnexpand} type="primary">
            {expanded ? "Alle zuklappen" : "Alle aufklappen"}
          </Button>,
        ]}
        title="Änderungsverlauf"
      />
      <RowWrapper>
        <JazzRow>
          <Col lg={8} xs={24}>
            <SingleSelect
              label="Tabelle"
              name="collection"
              onChange={selectCollection}
              options={["Veranstaltung", "Vermietung", "Programmheft", "Termine", "Mailregeln", "Optionen", "User", "Rider"]}
            />
          </Col>
          <Col lg={16} xs={24}>
            <SingleSelect label="ID" name="id" onChange={selectId} options={displayIds ?? []} />
          </Col>
        </JazzRow>
        <JazzRow>
          <Col span={24}>
            <Changelog collection={collection} expanded={expanded} id={realId} />
          </Col>
        </JazzRow>
      </RowWrapper>
    </Form>
  );
}
