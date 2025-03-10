import React, { useMemo } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Table, Typography } from "antd";
import Konzert from "jc-shared/konzert/konzert.ts";
import KonzertKalkulation from "jc-shared/konzert/konzertKalkulation.ts";
import { ColumnType } from "antd/es/table";
import { formatToGermanNumberString } from "@/commons/utilityFunctions";
import { useWatch } from "antd/es/form/Form";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { JazzRow } from "@/widgets/JazzRow";
import useAusgaben from "@/components/konzert/kosten/useAusgaben.ts";
import useEinnahmen from "@/components/konzert/kosten/useEinnahmen.ts";

export default function EinAusCard() {
  const form = useFormInstance();
  const ausgaben = useAusgaben();
  const einnahmen = useEinnahmen();

  const brauchtHotel = useWatch(["artist", "brauchtHotel"], { preserve: true });
  const deal = useWatch(["kosten", "deal"], { preserve: true });

  const kalk = useMemo(
    () => {
      const konzert = new Konzert(form.getFieldsValue(true));
      return new KonzertKalkulation(konzert);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [einnahmen, ausgaben, form, brauchtHotel, deal],
  );

  function format(amount: number): string {
    return `${formatToGermanNumberString(amount)} €`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnType<any>[] = [
    { title: "", dataIndex: "first", key: "first", render: (text) => <b>{text}</b>, align: "right" },
    { title: "Eintritt", dataIndex: "second", key: "second", align: "right" },
    { title: "Ausgaben", dataIndex: "third", key: "third", align: "right" },
    { title: "Überschuss", dataIndex: "fourth", key: "fourth", align: "right" },
  ];

  const data = [
    {
      key: 1,
      first: "",
      second: format(kalk?.einnahmenGesamtEUR ?? 0),
      third: format(kalk?.kostenGesamtEUR ?? 0),
      fourth: format(kalk?.bruttoUeberschussEUR ?? 0),
    },
    {
      key: 2,
      first: "Anteilig an Band:",
      second: "",
      third: "",
      fourth: format(kalk?.dealAbsolutEUR ?? 0),
    },
  ];

  return (
    <Collapsible amount={kalk?.dealUeberschussTotal} label="Kostenübersicht / Break-Even" suffix="concert">
      <JazzRow>
        <Col span={24}>
          <Typography.Text strong type="danger">
            Solange nicht freigegeben, sind die Werte eine Schätzung. Bei freiem Eintritt wird mit 10 € pro Gast gerechnet.
          </Typography.Text>
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={24}>
          <Table columns={columns} dataSource={data} pagination={false} size="small" />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
