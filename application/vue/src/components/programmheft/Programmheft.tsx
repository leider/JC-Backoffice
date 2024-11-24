import { kalenderFor, saveProgrammheft } from "@/commons/loader.ts";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { App, Col, Form, Row } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { SaveButton } from "@/components/colored/JazzButtons";
import DatumUhrzeit, { AdditionOptions } from "jc-shared/commons/DatumUhrzeit";
import Kalender from "jc-shared/programmheft/kalender";
import { Event } from "jc-shared/programmheft/Event.ts";
import HeftCalendar from "@/components/programmheft/HeftCalendar";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { ProgrammheftVeranstaltungenRow } from "@/components/programmheft/ProgrammheftVeranstaltungenRow.tsx";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { useWatch } from "antd/es/form/Form";
import ProgrammheftKopierenButton from "@/components/programmheft/ProgrammheftKopierenButton.tsx";
import { CollectionColDesc, InlineCollectionEditable } from "@/widgets/InlineCollectionEditable";
import { logDiffForDirty } from "jc-shared/commons/comparingAndTransforming.ts";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import cloneDeep from "lodash/cloneDeep";
import User from "jc-shared/user/user.ts";

export default function Programmheft() {
  const [search, setSearch] = useSearchParams();
  const [year, month] = useMemo(() => {
    return [search.get("year"), search.get("month")];
  }, [search]);
  const { showSuccess, allUsers } = useJazzContext();
  const { modal } = App.useApp();

  const [usersAsOptions, setUsersAsOptions] = useState<UserWithKann[]>([]);
  const usersWithBooking = useMemo(() => {
    const result = cloneDeep(allUsers);
    result.push(new User({ id: "booking", name: "Booking Team", email: "booking@jazzclub.de" }));
    return result;
  }, [allUsers]);
  useEffect(() => {
    setUsersAsOptions(usersWithBooking.map((user) => ({ label: user.name, value: user.id, kann: user.kannSections })));
  }, [usersWithBooking]);

  const naechsterUngeraderMonat = useMemo(() => new DatumUhrzeit().naechsterUngeraderMonat, []);

  const defaultYear = useMemo(() => naechsterUngeraderMonat.format("YYYY"), [naechsterUngeraderMonat]);
  const defaultMonth = useMemo(() => naechsterUngeraderMonat.format("MM"), [naechsterUngeraderMonat]);
  const realYear = useMemo(() => year ?? defaultYear, [defaultYear, year]);
  const realMonth = useMemo(() => month ?? defaultMonth, [defaultMonth, month]);

  const start = useMemo(() => {
    return (DatumUhrzeit.forYYYYMM(`${realYear}${realMonth}`) || new DatumUhrzeit()).vorigerOderAktuellerUngeraderMonat;
  }, [realMonth, realYear]);

  const { data } = useQuery({
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
    if (data) {
      setKalender(data);
    }
  }, [data]);

  const mutateContent = useMutation({
    mutationFn: saveProgrammheft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kalender"] });
      showSuccess({ text: "Das Programmheft wurde gespeichert" });
    },
  });

  const [form] = Form.useForm<Kalender>();

  useEffect(() => {
    kalender.events.forEach((event) => event.enhance(usersWithBooking));
    const deepCopy = { ...kalender };
    const initial = { ...kalender };
    setInitialValue(initial);
    form.setFieldsValue(deepCopy);
    setDirty(areDifferent(initial, deepCopy));
    form.validateFields();
  }, [form, kalender, usersWithBooking]);

  function saveForm() {
    form.validateFields().then(async () => {
      const kalenderNew = new Kalender(form.getFieldsValue(true));
      kalenderNew.text = "";
      kalenderNew.migrated = true;
      mutateContent.mutate(kalenderNew);
      setKalender(kalenderNew);
    });
  }

  const events = useWatch("events", { form, preserve: true });

  const [calEvents, setCalEvents] = useState<Event[]>([]);
  useEffect(() => {
    const current = form.getFieldsValue(true);
    setDirty(areDifferent(initialValue, current));
    setCalEvents((events ?? []).map((event) => new Event(event)));
  }, [events, form, initialValue]);

  const nextOrPrevious = useCallback(
    (next: boolean) => {
      function proceed() {
        const date = next ? start.plus({ monate: 2 }) : start.minus({ monate: 2 });
        setSearch({ year: date.format("YYYY"), month: date.format("MM") }, { replace: true });
      }

      if (dirty) {
        modal.confirm({
          title: "Änderungen gefunden",
          content: "Willst Du Deine Änderungen verwerfen?",
          onCancel: proceed,
          cancelText: "Ja, verwerfen",
          okText: "Nein, ich will zurück",
        });
      } else {
        proceed();
      }
    },
    [dirty, modal, start, setSearch],
  );

  const moveEvents = useCallback(
    (offset: number) => {
      function moveEventsBy(events: Event[], options: AdditionOptions) {
        const result = events.map((each) => new Event(each).moveBy(options));
        result.sort((a, b) => a.start.localeCompare(b.start));
        return result;
      }

      const newEvents = moveEventsBy(events, { tage: offset });
      form.setFieldValue("events", newEvents);
    },
    [events, form],
  );

  const columnDescriptions: CollectionColDesc[] = [
    { fieldName: ["was"], label: "Was", type: "text", width: "m", required: true },
    { fieldName: ["start"], label: "Wann", type: "date", width: "s", required: true },
    {
      fieldName: ["farbe"],
      label: "Farbe",
      type: "color",
      width: "xs",
      required: true,
      presets: ["firebrick", "coral", "blue", "dodgerblue", "green", "yellowgreen"],
    },
    { fieldName: "users", label: "Users", type: "user", width: "xl", usersWithKann: usersAsOptions, required: true },
    { fieldName: ["emailOffset"], label: "Tage vorher", type: "integer", width: "xs" },
  ];
  return (
    <Form
      form={form}
      onValuesChange={() => {
        const current = form.getFieldsValue(true);
        logDiffForDirty(initialValue, current, false);
        setDirty(areDifferent(initialValue, current));
      }}
      onFinish={saveForm}
      layout="vertical"
    >
      <JazzPageHeader
        title={`Programmheft ${start.monatJahrKompakt} - ${start.plus({ monate: 1 }).monatJahrKompakt}`}
        buttons={[
          <ButtonWithIcon key="prev" icon="ArrowBarLeft" onClick={() => nextOrPrevious(false)} type="default" />,
          <ButtonWithIcon key="next" icon="ArrowBarRight" onClick={() => nextOrPrevious(true)} type="default" />,
          <ProgrammheftKopierenButton key="copy" form={form} />,
          <SaveButton key="save" disabled={!dirty} />,
        ]}
      />
      <RowWrapper>
        <Row gutter={12}>
          <Col xs={24} lg={8} style={{ zIndex: 0 }}>
            <HeftCalendar initialDate={start.minus({ monate: 2 }).fuerCalendarWidget} events={calEvents} />
          </Col>
          <Col xs={24} lg={16}>
            <InlineCollectionEditable form={form} columnDescriptions={columnDescriptions} embeddedArrayPath={["events"]} />
            <Row>
              <Col span={12}>
                <ButtonWithIcon block icon="DashCircleFill" onClick={() => moveEvents(-1)} type="default" text="Tag zurück" />
              </Col>
              <Col span={12}>
                <ButtonWithIcon block icon="PlusCircleFill" onClick={() => moveEvents(1)} type="default" text="Tag vor" />
              </Col>
            </Row>
          </Col>
        </Row>
        <ProgrammheftVeranstaltungenRow start={start} />
      </RowWrapper>
    </Form>
  );
}
