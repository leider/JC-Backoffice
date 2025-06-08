import * as React from "react";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { ConfigProvider, Table, TableProps } from "antd";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { TeamContext } from "@/components/team/TeamContext.ts";
import map from "lodash/map";
import keys from "lodash/keys";
import forEach from "lodash/forEach";
import { Link } from "react-router";
import { TableRef } from "antd/es/table";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import "./teamTable.css";
const columns: TableProps<VeranstaltungAsRow>["columns"] = [
  {
    title: "Typ",
    dataIndex: "typ",
    render: (value: TypInRow) => <span style={{ color: value.color }}>{value.name}</span>,
    sorter: (a, b) => a.typ.name.localeCompare(b.typ.name),
  },
  {
    title: "Datum",
    dataIndex: "datum",
    render: (value: string, record) => (
      <span style={record.name !== "" ? { display: "block", textAlign: "right" } : { fontWeight: "bold" }}>{value}</span>
    ),
    sorter: (a, b) => a.isoDate.localeCompare(b.isoDate),
  },
  {
    title: "Name",
    dataIndex: "name",
    filterSearch: true,
    render: (value: string, record) => <Link to={record.url}>{value}</Link>,
  },
];

type TypInRow = { name: string; color: string };

type VeranstaltungAsRow = {
  key: string;
  datum: string;
  isoDate: string;
  name: string;
  typ: TypInRow;
  url: string;
};

function veranstaltungToRow(veranstaltung: Veranstaltung): VeranstaltungAsRow {
  return {
    key: veranstaltung.id ?? "",
    datum: veranstaltung.startDatumUhrzeit.mitUhrzeitNumerisch,
    isoDate: veranstaltung.startDate.toISOString(),
    name: veranstaltung.kopf.titelMitPrefix,
    typ: { name: veranstaltung.kopf.eventTypRich?.name ?? "Vermietung", color: veranstaltung.kopf.eventTypRich?.color ?? "black" },
    url: veranstaltung?.fullyQualifiedUrl,
  };
}

function nachMonatToRows(veranstaltungenNachMonat: { [p: string]: Veranstaltung[] }) {
  const monate = keys(veranstaltungenNachMonat);
  let result: VeranstaltungAsRow[] = [];
  forEach(monate, (monat) => {
    const current = veranstaltungenNachMonat[monat];
    result.push({
      key: monat,
      datum: monat,
      isoDate: current[0].startDatumUhrzeit.setTag(0).toISOString,
      name: "",
      typ: { name: "", color: "black" },
      url: "",
    });
    const rows = map(current, veranstaltungToRow);
    result = result.concat(rows);
  });
  return result;
}

export default function TeamTable() {
  const { veranstaltungenNachMonat } = useContext(TeamContext);
  const { memoizedVeranstaltung } = useJazzContext();

  const data = useMemo(() => nachMonatToRows(veranstaltungenNachMonat), [veranstaltungenNachMonat]);

  const tableRef = useRef<TableRef>(null);

  const memoId = useMemo(() => memoizedVeranstaltung?.veranstaltung?.id, [memoizedVeranstaltung?.veranstaltung?.id]);

  useEffect(() => {
    tableRef.current?.scrollTo({ key: memoId });
  }, [memoId]);

  const rowClassName = useCallback((record: VeranstaltungAsRow) => (record.key === memoId ? "table-row-highlight" : ""), [memoId]);

  return (
    <ConfigProvider theme={{ components: { Table: { cellPaddingBlockSM: 2, cellPaddingInlineSM: 8 } } }}>
      <Table bordered columns={columns} dataSource={data} pagination={false} ref={tableRef} rowClassName={rowClassName} size="small" />
    </ConfigProvider>
  );
}
