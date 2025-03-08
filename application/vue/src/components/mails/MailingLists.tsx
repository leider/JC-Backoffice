import { useQuery } from "@tanstack/react-query";
import { allUsers, saveMailinglists } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Col } from "antd";
import Users, { Mailingliste } from "jc-shared/user/users";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { Columns } from "@/widgets/EditableTable/types.ts";
import cloneDeep from "lodash/cloneDeep";
import JazzFormAndHeader from "@/components/content/JazzFormAndHeader.tsx";
import User from "jc-shared/user/user.ts";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import map from "lodash/map";
import { JazzRow } from "@/widgets/JazzRow.tsx";

class MailingListsWrapper {
  allLists: Mailingliste[] = [];

  constructor(lists?: Mailingliste[]) {
    this.allLists = map(lists, (list) => ({ ...list })).sort((a, b) => a.name.localeCompare(b.name));
  }
  toJSON(): object {
    return cloneDeep(this);
  }
}

function MailingListsInternal({ users }: { users: User[] }) {
  const usersAsOptions = useMemo(() => map(users, "asUserAsOption"), [users]);

  const columnDescriptions: Columns[] = [
    { dataIndex: "name", title: "Name", type: "text", width: "150px", required: true, uniqueValues: true },
    { dataIndex: "users", title: "Users", type: "user", usersWithKann: usersAsOptions, required: true },
  ];

  return (
    <JazzRow>
      <Col span={24}>
        <EditableTable<{ name?: string; users: string[] }>
          columnDescriptions={columnDescriptions}
          name="allLists"
          newRowFactory={(val) => Object.assign({ users: [] }, val)}
          usersWithKann={usersAsOptions}
        />
      </Col>
    </JazzRow>
  );
}

export default function MailingLists() {
  const { data, refetch } = useQuery({ queryKey: ["users"], queryFn: () => allUsers() });

  const [mailingLists, setMailingLists] = useState<MailingListsWrapper>(new MailingListsWrapper([]));
  useEffect(() => {
    setMailingLists(new MailingListsWrapper(new Users(data ?? []).mailinglisten));
  }, [data]);

  const mutateLists = useJazzMutation({
    saveFunction: saveMailinglists,
    queryKey: "users",
    successMessage: "Die Listen wurden gespeichert",
  });

  function saveForm(vals: MailingListsWrapper) {
    mutateLists.mutate(vals.allLists);
  }

  return (
    <JazzFormAndHeader data={mailingLists} resetChanges={refetch} saveForm={saveForm} title="Mailinglisten">
      <MailingListsInternal users={data ?? []} />
    </JazzFormAndHeader>
  );
}
