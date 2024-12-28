import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mailRules as mailRulesRestCall, saveMailRules } from "@/commons/loader.ts";
import * as React from "react";
import { useMemo } from "react";
import { Col, Row } from "antd";
import MailRule, { allMailrules } from "jc-shared/mail/mailRule";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { Columns } from "@/widgets/EditableTable/types.ts";
import cloneDeep from "lodash/cloneDeep";
import JazzFormAndHeader from "@/components/content/JazzFormAndHeader.tsx";

class MailRulesWrapper {
  allRules: MailRule[] = [];

  constructor(rules?: MailRule[]) {
    this.allRules = (rules ?? []).map((rule) => rule.toJSON());
  }
  toJSON(): object {
    return cloneDeep(this);
  }
}

function MailRulesInternal() {
  const columnDescriptions: Columns[] = [
    { dataIndex: "name", title: "Name", type: "text", required: true, uniqueValues: true },
    { dataIndex: "email", title: "E-Mail", type: "text", required: true },
    { dataIndex: "rule", title: "Regel", type: "text", width: "250px", filters: allMailrules },
  ];

  return (
    <RowWrapper>
      <Row gutter={12}>
        <Col span={24}>
          <EditableTable<MailRule>
            columnDescriptions={columnDescriptions}
            name="allRules"
            newRowFactory={(vals) => Object.assign({}, vals)}
          />
        </Col>
      </Row>
    </RowWrapper>
  );
}

export default function MailRules() {
  const { data } = useQuery({
    queryKey: ["mailRules"],
    queryFn: mailRulesRestCall,
  });
  const mailRules = useMemo(() => new MailRulesWrapper(data), [data]);
  const { showSuccess } = useJazzContext();

  const queryClient = useQueryClient();
  const mutateRules = useMutation({
    mutationFn: saveMailRules,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mailRules"] });
      showSuccess({ text: "Die Regeln wurden gespeichert" });
    },
  });

  function saveForm(vals: MailRulesWrapper) {
    mutateRules.mutate(vals.allRules);
  }

  return (
    <JazzFormAndHeader title="Mailing Regeln" data={mailRules} saveForm={saveForm}>
      <MailRulesInternal />
    </JazzFormAndHeader>
  );
}
