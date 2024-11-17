import { kalenderFor, saveProgrammheft } from "@/commons/loader.ts";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Col, Form, Row } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { SaveButton } from "@/components/colored/JazzButtons";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Kalender from "jc-shared/programmheft/kalender";
import { Event } from "jc-shared/programmheft/Event";
import HeftCalendar from "@/components/programmheft/HeftCalendar";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { ProgrammheftVeranstaltungenRow } from "@/components/programmheft/ProgrammheftVeranstaltungenRow.tsx";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { MarkdownEditor } from "@/widgets/MarkdownEditor.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { useWatch } from "antd/es/form/Form";

export default function Programmheft() {
  const [search, setSearch] = useSearchParams();
  const [year, month] = useMemo(() => {
    return [search.get("year"), search.get("month")];
  }, [search]);
  const { showSuccess } = useJazzContext();

  const naechsterUngeraderMonat = useMemo(() => new DatumUhrzeit().naechsterUngeraderMonat, []);

  const defaultYear = useMemo(() => naechsterUngeraderMonat.format("YYYY"), [naechsterUngeraderMonat]);
  const defaultMonth = useMemo(() => naechsterUngeraderMonat.format("MM"), [naechsterUngeraderMonat]);
  const realYear = useMemo(() => year ?? defaultYear, [defaultYear, year]);
  const realMonth = useMemo(() => month ?? defaultMonth, [defaultMonth, month]);

  const start = useMemo(() => {
    return (DatumUhrzeit.forYYYYMM(`${realYear}${realMonth}`) || new DatumUhrzeit()).vorigerOderAktuellerUngeraderMonat;
  }, [realMonth, realYear]);

  const { data: dataKalender } = useQuery({
    queryKey: ["kalender", `${realYear}-${realMonth}`],
    queryFn: () => kalenderFor(`${realYear}/${realMonth}`),
  });
  const [kalender, setKalender] = useState<Kalender>(new Kalender());

  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);
  useDirtyBlocker(dirty);

  const queryClient = useQueryClient();

  document.title = "Programmheft";

  useEffect(() => {
    if (dataKalender) {
      setKalender(dataKalender);
    }
  }, [dataKalender]);

  const mutateContent = useMutation({
    mutationFn: saveProgrammheft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kalender"] });
      showSuccess({ text: "Das Programmheft wurde gespeichert" });
    },
  });

  const [form] = Form.useForm<Kalender>();

  const textChanged = useCallback(() => {
    setEvents(new Kalender(form.getFieldsValue(true)).asEvents());
  }, [form]);

  const text = useWatch("text", { form, preserve: true });
  useEffect(() => {
    textChanged();
  }, [text, textChanged]);

  useEffect(() => {
    const deepCopy = { ...kalender };
    const initial = { ...kalender };
    setInitialValue(initial);
    form.setFieldsValue(deepCopy);
    setDirty(areDifferent(initial, deepCopy));
    form.validateFields();
    setEvents(kalender.asEvents());
  }, [form, kalender]);

  function saveForm() {
    form.validateFields().then(async () => {
      const kalenderNew = new Kalender(form.getFieldsValue(true));
      mutateContent.mutate(kalenderNew);
      setKalender(kalenderNew);
    });
  }

  const [events, setEvents] = useState<Event[]>([]);
  const previous = useCallback(() => {
    const prevDate = start.minus({ monate: 2 });
    setSearch({ year: prevDate.format("YYYY"), month: prevDate.format("MM") }, { replace: true });
  }, [start, setSearch]);

  const next = useCallback(() => {
    const nextDate = start.plus({ monate: 2 });
    setSearch({ year: nextDate.format("YYYY"), month: nextDate.format("MM") }, { replace: true });
  }, [start, setSearch]);

  const copyFromPrevious = useCallback(async () => {
    const prevDate = start.minus({ monate: 2 });
    const prevKal = await kalenderFor(`${prevDate.format("YYYY")}/${prevDate.format("MM")}`);
    form.setFieldValue("text", prevKal.textMovedTwoMonths());
  }, [form, start]);

  return (
    <Form
      form={form}
      onValuesChange={() => {
        // const diff = detailedDiff(initialValue, form.getFieldsValue(true));
        // console.log({ diff });
        // console.log({ initialValue });
        // console.log({ form: form.getFieldsValue(true) });
        setDirty(areDifferent(initialValue, form.getFieldsValue(true)));
      }}
      onFinish={saveForm}
      layout="vertical"
    >
      <JazzPageHeader
        title={`Programmheft ${start.monatJahrKompakt} - ${start.plus({ monate: 1 }).monatJahrKompakt}`}
        buttons={[
          <ButtonWithIcon key="prev" icon="ArrowBarLeft" onClick={previous} type="default" />,
          <ButtonWithIcon key="next" icon="ArrowBarRight" onClick={next} type="default" />,
          <ButtonWithIcon text="Kopieren aus Vormonat" key="copy" icon="FileEarmarkPlus" onClick={copyFromPrevious} type="default" />,
          <SaveButton key="save" disabled={!dirty} />,
        ]}
      />
      <RowWrapper>
        <Row gutter={12}>
          <Col xs={24} lg={8} style={{ zIndex: 0 }}>
            <HeftCalendar initialDate={start.minus({ monate: 2 }).fuerCalendarWidget} events={events} />
          </Col>
          {/*<Col xs={24} lg={8} style={{ zIndex: 0 }}>*/}
          {/*  <HeftCalendar initialDate={start.minus({ monate: 1 }).fuerCalendarWidget} events={events} />*/}
          {/*</Col>*/}
          <Col xs={24} lg={16}>
            <MarkdownEditor name="text" />
            <h4>Farben Hilfe</h4>
            <p>
              Du kannst entweder eine{" "}
              <a href="https://www.w3schools.com/colors/colors_names.asp" target="_blank" rel="noreferrer">
                Farbe mit Namen eintragen
              </a>{" "}
              oder einen HEX-Code als "#RGB" oder "#RRGGBB".
            </p>
          </Col>
        </Row>
        <ProgrammheftVeranstaltungenRow start={start} />
      </RowWrapper>
    </Form>
  );
}
