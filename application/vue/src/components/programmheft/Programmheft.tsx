import { kalenderFor, saveProgrammheft } from "@/commons/loader.ts";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Col, Form, Row, Splitter } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
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
import { logDiffForDirty } from "jc-shared/commons/comparingAndTransforming.ts";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import cloneDeep from "lodash/cloneDeep";
import User from "jc-shared/user/user.ts";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import useCheckErrors from "@/commons/useCheckErrors.ts";
import { Columns } from "@/widgets/EditableTable/types.ts";

export default function Programmheft() {
  const { year, month } = useParams();
  const { showSuccess, allUsers } = useJazzContext();
  const { lg } = useBreakpoint();

  const [usersAsOptions, setUsersAsOptions] = useState<UserWithKann[]>([]);
  const usersWithBooking = useMemo(() => {
    const result = cloneDeep(allUsers);
    result.push(new User({ id: "booking", name: "Booking Team", email: "booking@jazzclub.de" }));
    return result;
  }, [allUsers]);
  useEffect(() => {
    setUsersAsOptions(usersWithBooking.map((user) => ({ label: user.name, value: user.id, kann: user.kannSections })));
  }, [usersWithBooking]);

  const start = useMemo(() => {
    return (DatumUhrzeit.forYYYYMM(`${year}${month}`) || new DatumUhrzeit()).vorigerOderAktuellerUngeraderMonat;
  }, [month, year]);

  const { data } = useQuery({
    queryKey: ["kalender", `${year}-${month}`],
    queryFn: () => kalenderFor(`${year}/${month}`),
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

  const navigate = useNavigate();
  const nextOrPrevious = useCallback(
    (next: boolean) => {
      const date = next ? start.plus({ monate: 2 }) : start.minus({ monate: 2 });
      navigate(`/programmheft/${date.format("YYYY/MM")}`, { replace: true });
    },
    [navigate, start],
  );

  const moveEvents = useCallback(
    (offset: number) => {
      function moveEventsBy(events: Event[], options: AdditionOptions) {
        const result = events.map((each) => each.cloneAndMoveBy(options));
        result.sort((a, b) => a.start.localeCompare(b.start));
        return result;
      }

      const newEvents = moveEventsBy(events, { tage: offset });
      form.setFieldValue("events", newEvents);
    },
    [events, form],
  );

  const columnDescriptions: Columns[] = [
    { dataIndex: "was", title: "Was", type: "text", width: "20%", required: true },
    { dataIndex: "start", title: "Wann", type: "date", required: true },
    { dataIndex: "farbe", title: "Farbe", type: "color", required: true, presets: true },
    { dataIndex: "users", title: "Users", type: "user", required: true },
    { dataIndex: "emailOffset", title: "Tage vorher", type: "integer" },
  ];

  const [triggerRender, setTriggerRender] = useState(true);

  const { hasErrors, checkErrors } = useCheckErrors(form);

  return (
    <Form
      form={form}
      onValuesChange={() => {
        const current = form.getFieldsValue(true);
        logDiffForDirty(initialValue, current, false);
        setDirty(areDifferent(initialValue, current));
        checkErrors();
      }}
      onFinish={saveForm}
      layout="vertical"
    >
      <JazzPageHeader
        title={`Programmheft ${start.monatJahrKompakt} - ${start.plus({ monate: 1 }).monatJahrKompakt}`}
        buttons={[
          <ButtonWithIcon key="prev" icon="ArrowBarLeft" onClick={() => nextOrPrevious(false)} type="default" />,
          <ButtonWithIcon key="next" icon="ArrowBarRight" onClick={() => nextOrPrevious(true)} type="default" />,
          <ProgrammheftKopierenButton key="copy" />,
          <SaveButton key="save" disabled={!dirty || hasErrors} />,
        ]}
        hasErrors={hasErrors}
      />
      <RowWrapper>
        <Splitter
          onResize={() => {
            setTriggerRender(!triggerRender);
          }}
          layout={lg ? "horizontal" : "vertical"}
        >
          <Splitter.Panel defaultSize="40%" min="20%" max="70%">
            <HeftCalendar initialDate={start.minus({ monate: 2 }).fuerCalendarWidget} events={calEvents} triggerRender={triggerRender} />
          </Splitter.Panel>
          <Splitter.Panel>
            <EditableTable<Event>
              name={"events"}
              columnDescriptions={columnDescriptions}
              usersWithKann={usersAsOptions}
              newRowFactory={(vals) => new Event(vals)}
            />
            <Row>
              <Col span={12}>
                <ButtonWithIcon block icon="DashCircleFill" onClick={() => moveEvents(-1)} type="default" text="Tag zurück" />
              </Col>
              <Col span={12}>
                <ButtonWithIcon block icon="PlusCircleFill" onClick={() => moveEvents(1)} type="default" text="Tag vor" />
              </Col>
            </Row>
          </Splitter.Panel>
        </Splitter>
        <ProgrammheftVeranstaltungenRow start={start} />
      </RowWrapper>
    </Form>
  );
}
