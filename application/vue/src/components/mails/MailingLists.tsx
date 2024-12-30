import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveMailinglists } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Col, Row } from "antd";
import Users, { Mailingliste } from "jc-shared/user/users";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { Columns } from "@/widgets/EditableTable/types.ts";
import cloneDeep from "lodash/cloneDeep";
import JazzFormAndHeader from "@/components/content/JazzFormAndHeader.tsx";

class MailingListsWrapper {
  allLists: Mailingliste[] = [];

  constructor(lists?: Mailingliste[]) {
    this.allLists = (lists ?? []).map((list) => ({ ...list })).sort((a, b) => a.name.localeCompare(b.name));
  }
  toJSON(): object {
    return cloneDeep(this);
  }
}

function MailingListsInternal() {
  const { allUsers } = useJazzContext();
  const usersAsOptions = useMemo(() => allUsers.map((user) => ({ label: user.name, value: user.id, kann: user.kannSections })), [allUsers]);

  const columnDescriptions: Columns[] = [
    { dataIndex: "name", title: "Name", type: "text", width: "150px", required: true, uniqueValues: true },
    { dataIndex: "users", title: "Users", type: "user", usersWithKann: usersAsOptions, required: true },
  ];

  return (
    <RowWrapper>
      <Row gutter={12}>
        <Col span={24}>
          <EditableTable<{ name?: string; users: string[] }>
            columnDescriptions={columnDescriptions}
            name="allLists"
            newRowFactory={(val) => Object.assign({ users: [] }, val)}
            usersWithKann={usersAsOptions}
          />
        </Col>
      </Row>
    </RowWrapper>
  );
}

export default function MailingLists() {
  const { allUsers, showSuccess } = useJazzContext();
  const [mailingLists, setMailingLists] = useState<MailingListsWrapper>(new MailingListsWrapper([]));
  useEffect(() => {
    setMailingLists(new MailingListsWrapper(new Users(allUsers).mailinglisten));
  }, [allUsers]);

  const queryClient = useQueryClient();

  const mutateLists = useMutation({
    mutationFn: saveMailinglists,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showSuccess({ text: "Die Listen wurden gespeichert" });
    },
  });

  function saveForm(vals: MailingListsWrapper) {
    mutateLists.mutate(vals.allLists);
  }

  function resetLists() {
    setMailingLists(new MailingListsWrapper(new Users(allUsers).mailinglisten));
  }

  return (
    <JazzFormAndHeader title="Mailinglisten" data={mailingLists} saveForm={saveForm} resetChanges={resetLists}>
      <MailingListsInternal />
    </JazzFormAndHeader>
  );
}
