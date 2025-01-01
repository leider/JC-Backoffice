import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { saveTermine, termine as allTermine } from "@/commons/loader.ts";
import * as React from "react";
import { useMemo } from "react";
import { Col, Row } from "antd";
import Termin, { TerminType } from "jc-shared/optionen/termin";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { Columns } from "@/widgets/EditableTable/types.ts";
import cloneDeep from "lodash/cloneDeep";
import JazzFormAndHeader from "@/components/content/JazzFormAndHeader.tsx";

type TerminFlat = { dates: Date[]; beschreibung: string; typ?: TerminType };
class TermineWrapper {
  allTermine: TerminFlat[];

  constructor(termine?: Termin[]) {
    this.allTermine = (termine ?? []).map((termin) => ({
      dates: [termin.startDate, termin.endDate],
      beschreibung: termin.beschreibung ?? "",
      typ: termin.typ,
    }));
  }
  toJSON(): object {
    return cloneDeep(this);
  }
}

function TerminePageInternal() {
  const columnDescriptions: Columns[] = [
    { dataIndex: ["dates"], title: "Start und Ende", type: "startEnd", required: true },
    { dataIndex: "beschreibung", title: "Beschreibung", type: "text", required: true },
    { dataIndex: "typ", title: "Typ", type: "text", width: "120px", filters: ["Sonstiges", "Feiertag", "Ferien", "Vermietung"] },
  ];

  return (
    <RowWrapper>
      <Row gutter={12}>
        <Col span={24}>
          <EditableTable<Termin>
            columnDescriptions={columnDescriptions}
            name="allTermine"
            newRowFactory={(vals) => Object.assign({}, vals)}
          />
        </Col>
      </Row>
    </RowWrapper>
  );
}

export default function TerminePage() {
  const { data, refetch } = useQuery({ queryKey: ["termine"], queryFn: allTermine });

  const termine = useMemo(() => {
    return new TermineWrapper(data);
  }, [data]);
  const { showSuccess } = useJazzContext();
  const queryClient = useQueryClient();

  const mutateTermine = useMutation({
    mutationFn: saveTermine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["termine"] });
      showSuccess({});
    },
  });

  function saveForm(vals: TermineWrapper) {
    mutateTermine.mutate(
      vals.allTermine.map(
        (each: TerminFlat) =>
          new Termin({ startDate: each.dates[0], endDate: each.dates[1], beschreibung: each.beschreibung, typ: each.typ }),
      ),
    );
  }

  return (
    <JazzFormAndHeader title="Termine" data={termine} saveForm={saveForm} resetChanges={refetch}>
      <TerminePageInternal />
    </JazzFormAndHeader>
  );
}
