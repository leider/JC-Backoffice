import { useQuery } from "@tanstack/react-query";
import { mailRules as mailRulesRestCall, saveMailRules } from "@/rest/loader.ts";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { Col } from "antd";
import MailRule, { allMailrules, MailRuleUI } from "jc-shared/mail/mailRule";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { Columns } from "@/widgets/EditableTable/types.ts";
import JazzFormAndHeader from "@/components/content/JazzFormAndHeader.tsx";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import { JazzRow } from "@/widgets/JazzRow.tsx";

class MailRulesWrapper {
  allRules: MailRule[] = [];

  constructor(rules?: MailRule[]) {
    this.allRules = rules ?? [];
  }
}

function MailRulesInternal() {
  const columnDescriptions: Columns[] = [
    { dataIndex: "name", title: "Name", type: "text", required: true, uniqueValues: true },
    { dataIndex: "email", title: "E-Mail", type: "text", width: "30%", required: true },
    { dataIndex: "rule", title: "Regel", type: "text", width: "250px", filters: allMailrules },
  ];

  const newRuleFactory = useCallback((vals: MailRuleUI) => ({ ...vals, id: undefined }), []);
  return (
    <JazzRow>
      <Col span={24}>
        <EditableTable<MailRuleUI> columnDescriptions={columnDescriptions} name="allRules" newRowFactory={newRuleFactory} />
      </Col>
    </JazzRow>
  );
}

export default function MailRules() {
  const { data, refetch } = useQuery({
    queryKey: ["mailRules"],
    queryFn: mailRulesRestCall,
  });
  const mailRules = useMemo(() => new MailRulesWrapper(data), [data]);

  const mutateRules = useJazzMutation({
    saveFunction: saveMailRules,
    queryKey: "mailRules",
    successMessage: "Die Regeln wurden gespeichert",
  });

  const saveForm = useCallback((vals: MailRulesWrapper) => mutateRules.mutate(vals.allRules), [mutateRules]);

  return (
    <JazzFormAndHeader data={mailRules} resetChanges={refetch} saveForm={saveForm} title="Mailing Regeln">
      <MailRulesInternal />
    </JazzFormAndHeader>
  );
}
