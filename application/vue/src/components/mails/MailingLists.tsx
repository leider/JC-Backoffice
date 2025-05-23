import { useQuery } from "@tanstack/react-query";
import { allMailinglists, saveMailinglists } from "@/rest/loader.ts";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { Col } from "antd";
import { Mailingliste } from "jc-shared/user/users";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { Columns } from "@/widgets/EditableTable/types.ts";
import JazzFormAndHeader from "@/components/content/JazzFormAndHeader.tsx";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import map from "lodash/map";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

function MailingListsInternal() {
  const { allUsers } = useJazzContext();
  const usersAsOptions = useMemo(() => map(allUsers, "asUserAsOption"), [allUsers]);

  const columnDescriptions: Columns[] = [
    { dataIndex: "name", title: "Name", type: "text", width: "150px", required: true, uniqueValues: true },
    { dataIndex: "users", title: "Users", type: "user", usersWithKann: usersAsOptions, required: true },
  ];

  const newMailinglisteFactory = useCallback((val: Mailingliste) => Object.assign({ users: [] }, val), []);

  return (
    <JazzRow>
      <Col span={24}>
        <EditableTable<Mailingliste>
          columnDescriptions={columnDescriptions}
          name="lists"
          newRowFactory={newMailinglisteFactory}
          usersWithKann={usersAsOptions}
        />
      </Col>
    </JazzRow>
  );
}

export default function MailingLists() {
  const { data: mailingLists, refetch } = useQuery({ queryKey: ["mailinglists"], queryFn: allMailinglists });

  const mutateLists = useJazzMutation({
    saveFunction: saveMailinglists,
    queryKey: "users",
    successMessage: "Die Listen wurden gespeichert",
  });

  const saveForm = useCallback((vals: { lists: Mailingliste[] }) => mutateLists.mutate(vals), [mutateLists]);

  return (
    <JazzFormAndHeader data={mailingLists} resetChanges={refetch} saveForm={saveForm} title="Mailinglisten">
      <MailingListsInternal />
    </JazzFormAndHeader>
  );
}
