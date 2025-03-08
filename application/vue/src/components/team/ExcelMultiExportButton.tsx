import { Col, DatePicker, Form, Row, TimeRangePickerProps } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "antd/es/form/Form";
import dayjs, { Dayjs } from "dayjs";
import { konzerteBetweenYYYYMM, vermietungenBetweenYYYYMM } from "@/commons/loader.ts";
import sortBy from "lodash/sortBy";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { useQueries } from "@tanstack/react-query";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import filter from "lodash/filter";
import { JazzModal } from "@/widgets/JazzModal.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import applyTeamFilter from "@/components/team/TeamFilter/applyTeamFilter.ts";
import { asExcelAuslastung } from "@/commons/excel/auslastung.ts";
import SingleSelect from "@/widgets/SingleSelect.tsx";
import { asExcelKalk } from "@/commons/excel/multiKalk.ts";

function SelectRangeForExcelModal({
  isOpen,
  setIsOpen,
  alle,
}: {
  readonly isOpen: boolean;
  readonly setIsOpen: (open: boolean) => void;
  readonly alle: { startDate: Date }[];
}) {
  const [form] = useForm();
  const { optionen, filter: teamFilter } = useJazzContext();

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
      form.setFieldsValue({ zeitraum: [dayjs().month(0).add(-1, "year"), dayjs().month(12).add(-1, "year")], exportType: "Kalkulation" });
    }
  }, [form, first, last, isOpen]);

  const rangePresets: TimeRangePickerProps["presets"] = [
    { label: "Letztes Kalenderjahr", value: [dayjs().month(0).add(-1, "year"), dayjs().month(12).add(-1, "year")] },
    { label: "Aktuelles Kalenderjahr", value: [dayjs().month(0), dayjs().month(12)] },
    { label: "Letzte 12 Monate", value: [dayjs().add(-12, "month"), dayjs()] },
    { label: "Letzte 6 Monate", value: [dayjs().add(-6, "month"), dayjs()] },
    { label: "Wie angezeigt", value: [first, last] },
  ];

  const zeitraum = useWatch("zeitraum", { form, preserve: true });
  const exportType = useWatch("exportType", { form, preserve: true });

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

  const bestaetigteFiltered = useMemo(() => filter(bestaetigte, applyTeamFilter(teamFilter)), [bestaetigte, teamFilter]);

  const okClicked = useCallback(() => {
    if (exportType === "Kalkulation") {
      asExcelKalk({ veranstaltungen: bestaetigteFiltered, optionen });
    } else {
      asExcelAuslastung({ veranstaltungen: bestaetigteFiltered, optionen });
    }
    setIsOpen(false);
  }, [bestaetigteFiltered, exportType, optionen, setIsOpen]);

  return (
    <JazzModal closable={false} maskClosable={false} onCancel={() => setIsOpen(false)} onOk={okClicked} open={isOpen}>
      <Form autoComplete="off" form={form} layout="vertical">
        <JazzPageHeader title="Excel Export" />
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item label={<b>Zeitraum für den Export:</b>} name="zeitraum">
              <DatePicker.RangePicker format="MMM YYYY" picker="month" presets={rangePresets} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <SingleSelect label="Art des Exports" name="exportType" options={["Kalkulation", "Auslastung"]} />
          </Col>
        </Row>
      </Form>
    </JazzModal>
  );
}

export default function ExcelMultiExportButton({ alle }: { readonly alle: Veranstaltung[] }) {
  const [isExcelExportOpen, setIsExcelExportOpen] = useState<boolean>(false);

  return (
    <>
      <SelectRangeForExcelModal alle={alle} isOpen={isExcelExportOpen} setIsOpen={setIsExcelExportOpen} />
      <ButtonWithIcon
        color="#5900b9"
        icon="FileEarmarkSpreadsheet"
        onClick={() => {
          setIsExcelExportOpen(true);
        }}
        text="Kalkulation (Excel)"
      />
    </>
  );
}
