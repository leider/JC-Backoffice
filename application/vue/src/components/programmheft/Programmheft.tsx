import { kalenderFor, saveProgrammheft } from "@/commons/loader.ts";
import * as React from "react";
import { useCallback, useMemo, useState } from "react";
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

function ProgrammheftInternal({ start }: { start: DatumUhrzeit }) {
  const form = useFormInstance();
  const events = useWatch("events", { form, preserve: true });

  const { allUsers } = useJazzContext();
  const usersAsOptions = useMemo(() => {
    const result = cloneDeep(allUsers);
    result.push(new User({ id: "booking", name: "Booking Team", email: "booking@jazzclub.de" }));
    return map(result, "asUserAsOption");
  }, [allUsers]);

  const moveEvents = useCallback(
    (offset: number) => {
      function moveEventsBy(events: Event[], options: AdditionOptions) {
        const result = invokeMap(events, "cloneAndMoveBy", options);
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

  const { lg } = useBreakpoint();
  return (
    <>
      <Splitter
        onResize={() => {
          setTriggerRender(!triggerRender);
        }}
        layout={lg ? "horizontal" : "vertical"}
      >
        <Splitter.Panel defaultSize="40%" min="20%" max="70%">
          <HeftCalendar initialDate={start.minus({ monate: 2 }).fuerCalendarWidget} events={events} triggerRender={triggerRender} />
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

  function saveForm(vals: Kalender) {
    const kalenderNew = new Kalender(vals);
    kalenderNew.migrated = true;
    mutateContent.mutate(kalenderNew);
  }

  const navigate = useNavigate();
  const nextOrPrevious = useCallback(
    (next: boolean) => {
      const date = next ? start.plus({ monate: 2 }) : start.minus({ monate: 2 });
      navigate(`/programmheft/${date.format("YYYY/MM")}`, { replace: true });
    },
    [navigate, start],
  );

  return (
    <JazzFormAndHeader
      title={`Programmheft ${start.monatJahrKompakt} - ${start.plus({ monate: 1 }).monatJahrKompakt}`}
      data={kalender}
      saveForm={saveForm}
      additionalButtons={[
        <ButtonWithIcon key="prev" icon="ArrowBarLeft" onClick={() => nextOrPrevious(false)} type="default" />,
        <ButtonWithIcon key="next" icon="ArrowBarRight" onClick={() => nextOrPrevious(true)} type="default" />,
        <ProgrammheftKopierenButton key="copy" />,
      ]}
      changedPropsToWatch={["events"]}
      resetChanges={refetch}
    >
      <ProgrammheftInternal start={start} />
    </JazzFormAndHeader>
  );
}
