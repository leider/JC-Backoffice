import { kalenderFor, saveProgrammheft } from "@/rest/loader.ts";
import * as React from "react";
import { useCallback, useContext, useMemo, useState } from "react";
import { Col, Row, Splitter } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import DatumUhrzeit, { AdditionOptions } from "jc-shared/commons/DatumUhrzeit";
import Kalender from "jc-shared/programmheft/kalender";
import { Event } from "jc-shared/programmheft/Event.ts";
import HeftCalendar from "@/components/programmheft/HeftCalendar";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { ProgrammheftVeranstaltungenRow } from "@/components/programmheft/ProgrammheftVeranstaltungenRow.tsx";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { useWatch } from "antd/es/form/Form";
import ProgrammheftKopierenButton from "@/components/programmheft/ProgrammheftKopierenButton.tsx";
import cloneDeep from "lodash/cloneDeep";
import User from "jc-shared/user/user.ts";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { Columns } from "@/widgets/EditableTable/types.ts";
import JazzFormAndHeader from "@/components/content/JazzFormAndHeader.tsx";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import map from "lodash/map";
import invokeMap from "lodash/invokeMap";
import sortBy from "lodash/sortBy";
import { JazzFormContext } from "@/components/content/useJazzFormContext.ts";

function ProgrammheftInternal({ start }: { readonly start: DatumUhrzeit }) {
  const form = useFormInstance();
  const events = useWatch("events", { form, preserve: true });
  const { checkDirty } = useContext(JazzFormContext);

  const { allUsers } = useJazzContext();
  const usersAsOptions = useMemo(() => {
    const result = cloneDeep(allUsers);
    result.push(new User({ id: "booking", name: "Booking Team", email: "booking@jazzclub.de" }));
    return map(result, "asUserAsOption");
  }, [allUsers]);

  const moveEvents = useCallback(
    (offset: number) => {
      function moveEventsBy(events: Event[], options: AdditionOptions) {
        const result: Event[] = invokeMap(events, "cloneAndMoveBy", options);
        return sortBy(result, "start");
      }

      const newEvents = moveEventsBy(events, { tage: offset });
      form.setFieldValue("events", newEvents);
      checkDirty();
    },
    [checkDirty, events, form],
  );

  const columnDescriptions: Columns[] = [
    { dataIndex: "was", title: "Was", type: "text", width: "20%", required: true },
    { dataIndex: "start", title: "Wann", type: "date", required: true },
    { dataIndex: "farbe", title: "Farbe", type: "color", required: true, presets: true },
    { dataIndex: "users", title: "Users", type: "user", required: true },
    { dataIndex: "emailOffset", title: "Tage vorher", type: "integer" },
  ];

  const [triggerRender, setTriggerRender] = useState(true);

  const { lg } = useBreakpoint();

  const plusOneDay = useCallback(() => moveEvents(1), [moveEvents]);
  const minusOneDay = useCallback(() => moveEvents(-1), [moveEvents]);
  const onResize = useCallback(() => {
    setTriggerRender(!triggerRender);
  }, [triggerRender]);
  const newRowFactory = useCallback((vals: Event) => new Event(vals), []);

  return (
    <>
      <Splitter layout={lg ? "horizontal" : "vertical"} onResize={onResize}>
        <Splitter.Panel collapsible defaultSize="40%" max="70%" min="20%" style={{ zIndex: 0 }}>
          <HeftCalendar events={events} initialDate={start.minus({ monate: 2 }).fuerCalendarWidget} triggerRender={triggerRender} />
        </Splitter.Panel>
        <Splitter.Panel collapsible>
          <EditableTable<Event>
            columnDescriptions={columnDescriptions}
            fixedMinHeight={600}
            name="events"
            newRowFactory={newRowFactory}
            usersWithKann={usersAsOptions}
          />
          <Row>
            <Col span={12}>
              <ButtonWithIcon block icon="DashCircleFill" onClick={minusOneDay} text="Tag zurück" type="default" />
            </Col>
            <Col span={12}>
              <ButtonWithIcon block icon="PlusCircleFill" onClick={plusOneDay} text="Tag vor" type="default" />
            </Col>
          </Row>
        </Splitter.Panel>
      </Splitter>
      <ProgrammheftVeranstaltungenRow start={start} />
    </>
  );
}

export default function Programmheft() {
  const { year, month } = useParams();

  const start = useMemo(() => {
    return (DatumUhrzeit.forYYYYMM(`${year}${month}`) || new DatumUhrzeit()).vorigerOderAktuellerUngeraderMonat;
  }, [month, year]);

  const { data, refetch } = useQuery({
    queryKey: ["kalender", `${year}-${month}`],
    queryFn: () => kalenderFor(`${year}/${month}`),
  });

  const kalender = useMemo(() => (data ? { ...data } : undefined), [data]);

  const mutateContent = useJazzMutation({
    saveFunction: saveProgrammheft,
    queryKey: "kalender",
    successMessage: "Das Programmheft wurde gespeichert",
  });

  const saveForm = useCallback(
    (vals: Kalender) => {
      const kalenderNew = new Kalender(vals);
      kalenderNew.migrated = true;
      mutateContent.mutate(kalenderNew);
    },
    [mutateContent],
  );

  const navigate = useNavigate();
  const nextOrPrevious = useCallback(
    (next: boolean) => {
      const date = next ? start.plus({ monate: 2 }) : start.minus({ monate: 2 });
      navigate(`/programmheft/${date.format("YYYY/MM")}`, { replace: true });
    },
    [navigate, start],
  );

  const right = useCallback(() => nextOrPrevious(true), [nextOrPrevious]);
  const left = useCallback(() => nextOrPrevious(false), [nextOrPrevious]);

  return (
    <JazzFormAndHeader
      additionalButtons={[
        <ButtonWithIcon icon="ArrowBarLeft" key="prev" onClick={left} text="Voriges" type="default" />,
        <ButtonWithIcon icon="ArrowBarRight" key="next" onClick={right} text="Nächstes" type="default" />,
        <ProgrammheftKopierenButton key="copy" />,
      ]}
      data={kalender}
      resetChanges={refetch}
      saveForm={saveForm}
      title={`Programmheft ${start.monatJahrKompakt} - ${start.plus({ monate: 1 }).monatJahrKompakt}`}
    >
      <ProgrammheftInternal start={start} />
    </JazzFormAndHeader>
  );
}
