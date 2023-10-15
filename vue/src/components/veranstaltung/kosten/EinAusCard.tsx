import React, { useCallback, useEffect, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Button, Col, Form, FormInstance, Row, Table } from "antd";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import VeranstaltungKalkulation from "jc-shared/veranstaltung/veranstaltungKalkulation";
import { ColumnType } from "antd/es/table";
import { formatToGermanNumberString } from "@/commons/utilityFunctions";
import { IconForSmallBlock } from "@/components/Icon.tsx";
import { utils, writeFileXLSX } from "xlsx";
import { createExcelData } from "jc-shared/excelPreparation/excelFormatters.ts";

interface AusgabenCardParams {
  einnahmen: number;
  ausgaben: number;
  form: FormInstance<Veranstaltung>;
}
export default function EinAusCard({ einnahmen, ausgaben, form }: AusgabenCardParams) {
  const [veranstaltung, setVeranstaltung] = useState<Veranstaltung>(new Veranstaltung());
  const [kalk, setKalk] = useState<VeranstaltungKalkulation>(new VeranstaltungKalkulation(new Veranstaltung()));

  const brauchtHotel = Form.useWatch(["artist", "brauchtHotel"], {
    form,
    preserve: true,
  });
  useEffect(() => {
    const veranst = new Veranstaltung(form.getFieldsValue(true));
    setVeranstaltung(veranst);
    setKalk(new VeranstaltungKalkulation(veranst));
  }, [einnahmen, ausgaben, form, brauchtHotel]);

  function format(amount: number): string {
    return `${formatToGermanNumberString(amount)} €`;
  }

  const columns: ColumnType<any>[] = [
    {
      title: "",
      dataIndex: "first",
      key: "first",
      render: (text) => <b>{text}</b>,
      align: "right",
    },
    { title: "Einnahmen", dataIndex: "second", key: "second", align: "right" },
    { title: "Ausgaben", dataIndex: "third", key: "third", align: "right" },
    { title: "Überschuss", dataIndex: "fourth", key: "fourth", align: "right" },
  ];

  const data = [
    {
      key: 1,
      first: "",
      second: format(kalk?.einnahmenGesamtEUR || 0),
      third: format(kalk?.kostenGesamtEUR || 0),
      fourth: format(kalk?.bruttoUeberschussEUR || 0),
    },
    {
      key: 2,
      first: "Anteilig an Band:",
      second: "",
      third: "",
      fourth: format(kalk?.dealAbsolutEUR || 0),
    },
  ];

  const downloadExcel = useCallback(() => {
    const sheet = utils.json_to_sheet(createExcelData(veranstaltung));
    sheet["!cols"] = [{ wch: 30 }, { wch: 10 }, { wch: 10 }];
    const book = utils.book_new();
    utils.book_append_sheet(
      book,
      sheet,
      veranstaltung?.kopf?.titel
        .replace(/\s/g, "-")
        .replace(/\//g, "-")
        .replace(/[^a-zA-Z0-9\- _]/g, "")
        .slice(0, 30) || "data",
    );
    writeFileXLSX(book, "JAZZ.xlsx");
  }, [veranstaltung, kalk]);

  return (
    <CollapsibleForVeranstaltung suffix="concert" label="Kostenübersicht / Break-Even" amount={kalk?.dealUeberschussTotal}>
      <Row gutter={12}>
        <Col span={24}>
          <Button icon={<IconForSmallBlock size={16} iconName={"Download"} />} onClick={downloadExcel}>
            Als Excel
          </Button>
        </Col>
        <Col span={24}>
          <Table columns={columns} dataSource={data} size="small" pagination={false} />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
