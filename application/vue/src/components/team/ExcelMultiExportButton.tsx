import { Col, DatePicker, Form, Modal, Row, TimeRangePickerProps } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "antd/es/form/Form";
import dayjs, { Dayjs } from "dayjs";
import { konzerteBetweenYYYYMM, vermietungenBetweenYYYYMM } from "@/commons/loader.ts";
import { asExcelKalk } from "@/commons/utilityFunctions.ts";
import sortBy from "lodash/sortBy";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { useQueries } from "@tanstack/react-query";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import filter from "lodash/filter";

export default function ExcelMultiExportButton({ alle }: { alle: Veranstaltung[] }) {
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

    const zeitraum = useWatch("zeitraum", { form, preserve: true });

    const fromTo = useMemo(() => {
      const [from, to] = (zeitraum as [Dayjs, Dayjs]) || [dayjs(), dayjs()];
      return [from.format("YYYYMM"), to.format("YYYYMM")];
    }, [zeitraum]);

    const bestaetigte = useQueries({
      queries: [
        { enabled: isOpen, queryKey: ["konzert", fromTo], queryFn: () => konzerteBetweenYYYYMM(fromTo[0], fromTo[1]) },
        { enabled: isOpen, queryKey: ["vermietung", fromTo], queryFn: () => vermietungenBetweenYYYYMM(fromTo[0], fromTo[1]) },
      ],
      combine: ([a, b]) => {
        if (a?.data && b?.data) {
          return filter(sortBy([...a.data, ...b.data], "startDate"), "kopf.confirmed");
        }
        return [];
      },
    });

    async function okClicked() {
      asExcelKalk(bestaetigte);
      setIsOpen(false);
    }

    return (
      <Modal open={isOpen} onCancel={() => setIsOpen(false)} onOk={okClicked} closable={false} maskClosable={false}>
        <Form form={form} layout="vertical" autoComplete="off">
          <JazzPageHeader title="Excel Export" />
          <Row gutter={8}>
            <Col span={24}>
              <Form.Item label={<b>Zeitraum für den Export:</b>} name="zeitraum">
                <DatePicker.RangePicker format="MMM YYYY" picker="month" presets={rangePresets} />
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
        icon="FileEarmarkSpreadsheet"
        onClick={() => {
          setIsExcelExportOpen(true);
        }}
        color="#5900b9"
      />
    </>
  );
}
