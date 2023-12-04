import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { Col, DatePicker, Form, Modal, Row, TimeRangePickerProps } from "antd";
import React, { useEffect, useState } from "react";
import { useForm } from "antd/es/form/Form";
import dayjs, { Dayjs } from "dayjs";
import { veranstaltungenBetweenYYYYMM, vermietungenBetweenYYYYMM } from "@/commons/loader.ts";
import { asExcelKalk } from "@/commons/utilityFunctions.ts";
import { PageHeader } from "@ant-design/pro-layout";
import sortBy from "lodash/sortBy";
import ButtonWithIcon from "@/widgets/ButtonWithIcon.tsx";

export default function ExcelMultiExportButton({ alle }: { alle: (Veranstaltung | Vermietung)[] }) {
  const [isExcelExportOpen, setIsExcelExportOpen] = useState<boolean>(false);

  function SelectRangeForExcelModal({
    isOpen,
    setIsOpen,
    alle,
  }: {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    alle: { startDate: Date }[];
  }) {
    const [form] = useForm();
    const [first, setFirst] = useState<Dayjs>(dayjs());
    const [last, setLast] = useState<Dayjs>(dayjs());
    useEffect(() => {
      if (alle.length > 0) {
        setFirst(dayjs(alle[0].startDate));
        setLast(dayjs(alle[alle.length - 1].startDate));
      }
    }, [alle]);

    useEffect(() => {
      if (isOpen) {
        form.setFieldValue("zeitraum", [first, last]);
      }
    }, [form, first, last, isOpen]);

    const rangePresets: TimeRangePickerProps["presets"] = [
      { label: "Wie angezeigt", value: [first, last] },
      { label: "Letzte 6 Monate", value: [dayjs().add(-6, "month"), dayjs()] },
      { label: "Letzte 12 Monate", value: [dayjs().add(-12, "month"), dayjs()] },
      { label: "Aktuelles Kalenderjahr", value: [dayjs().month(0), dayjs().month(11)] },
      { label: "Letztes Kalenderjahr", value: [dayjs().month(0).add(-1, "year"), dayjs().month(11).add(-1, "year")] },
    ];

    async function ok() {
      const [from, to] = form.getFieldValue("zeitraum") as [Dayjs, Dayjs];
      const vers = await veranstaltungenBetweenYYYYMM(from.format("YYYYMM"), to.format("YYYYMM"));
      const verm = await vermietungenBetweenYYYYMM(from.format("YYYYMM"), to.format("YYYYMM"));
      const bestaetigte = sortBy([...vers, ...verm], "startDate").filter((ver) => ver.kopf.confirmed);
      asExcelKalk(bestaetigte);
      setIsOpen(false);
    }

    return (
      <Modal open={isOpen} onCancel={() => setIsOpen(false)} onOk={ok} closable={false} maskClosable={false}>
        <Form form={form} onFinish={ok} layout="vertical" autoComplete="off">
          <PageHeader title="Excel Export" />
          <Row gutter={8}>
            <Col span={24}>
              <Form.Item label={<b>Zeitraum für den Export:</b>} name="zeitraum">
                <DatePicker.RangePicker format={"MMM YYYY"} picker="month" presets={rangePresets} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }

  return (
    <>
      <SelectRangeForExcelModal isOpen={isExcelExportOpen} setIsOpen={setIsExcelExportOpen} alle={alle} />
      <ButtonWithIcon
        text="Kalkulation (Excel)"
        type="primary"
        icon="FileEarmarkSpreadsheet"
        onClick={() => {
          setIsExcelExportOpen(true);
        }}
        color="#5900b9"
      />
    </>
  );
}
