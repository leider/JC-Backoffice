import { useQuery } from "@tanstack/react-query";
import { saveTermine, termine as allTermine } from "@/rest/loader.ts";
import * as React from "react";
import { useMemo } from "react";
import { Col } from "antd";
import Termin, { TerminType } from "jc-shared/optionen/termin";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { Columns } from "@/widgets/EditableTable/types.ts";
import cloneDeep from "lodash/cloneDeep";
import JazzFormAndHeader from "@/components/content/JazzFormAndHeader.tsx";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import map from "lodash/map";
import { JazzRow } from "@/widgets/JazzRow";

type TerminFlat = { dates: Date[]; beschreibung: string; typ?: TerminType };
class TermineWrapper {
  allTermine: TerminFlat[];

  constructor(termine?: Termin[]) {
    this.allTermine = map(termine, (termin) => ({
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
    <JazzRow>
      <Col span={24}>
        <EditableTable<Termin>
          columnDescriptions={columnDescriptions}
          name="allTermine"
          newRowFactory={(vals) => Object.assign({}, vals)}
        />
      </Col>
    </JazzRow>
  );
}

export default function TerminePage() {
  const { data, refetch } = useQuery({ queryKey: ["termine"], queryFn: allTermine });

  const termine = useMemo(() => {
    return new TermineWrapper(data);
  }, [data]);

  const mutateTermine = useJazzMutation<Termin[]>({
    saveFunction: saveTermine,
    queryKey: "termine",
    successMessage: "Die Termine wurden gespeichert",
  });

  function saveForm(vals: TermineWrapper) {
    mutateTermine.mutate(
      map(
        vals.allTermine,
        (each: TerminFlat) =>
          new Termin({ startDate: each.dates[0], endDate: each.dates[1], beschreibung: each.beschreibung, typ: each.typ }),
      ),
    );
  }

  return (
    <JazzFormAndHeader data={termine} resetChanges={refetch} saveForm={saveForm} title="Termine">
      <TerminePageInternal />
    </JazzFormAndHeader>
  );
}
