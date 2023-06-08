import React, { useEffect, useState } from "react";
import { allUsers, calendarEventSources, veranstaltungenForTeam } from "@/commons/loader-for-react";
import { Col, Row } from "antd";
import groupBy from "lodash/groupBy";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { useAuth } from "@/commons/auth";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ButtonWithIcon from "@/widgets-react/ButtonWithIcon";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import deLocale from "@fullcalendar/core/locales/de";
import { EventInput } from "@fullcalendar/core";
import { PageHeader } from "@ant-design/pro-layout";
import TeamMonatGroup from "@/components/team/TeamMonatGroup";

function Team() {
  const [usersAsOptions, setUsersAsOptions] = useState<{ label: string; value: string }[] | undefined>([]);

  async function loadUsers() {
    const users = await allUsers();
    setUsersAsOptions(users.map((user) => ({ label: user.name, value: user.id })));
  }

  const [veranstaltungen, setVeranstaltungen] = useState<Veranstaltung[]>([]);
  async function loadVeranstaltungen() {
    const result = await veranstaltungenForTeam("zukuenftige");
    setVeranstaltungen(result);
  }
  useEffect(() => {
    loadUsers();
    loadVeranstaltungen();
  }, []);

  const { context } = useAuth();
  const [realadmin, setRealadmin] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [veranstaltungenNachMonat, setVeranstaltungenNachMonat] = useState<{ [index: string]: Veranstaltung[] }>({});
  const [monate, setMonate] = useState<string[]>([]);
  useEffect(() => {
    const filteredVeranstaltungen = veranstaltungen.filter((v) => v.kopf.confirmed || realadmin);
    const result = groupBy(filteredVeranstaltungen, (veranst: Veranstaltung) => veranst.startDatumUhrzeit.monatLangJahrKompakt);
    setVeranstaltungenNachMonat(result);
    setMonate(Object.keys(result));
    const accessrights = context?.currentUser.accessrights;
    if (location.pathname !== "/team" && !accessrights?.isOrgaTeam) {
      navigate("/team");
    }
    setRealadmin(!!accessrights?.isSuperuser);
  }, [veranstaltungen, realadmin, context]);

  function getEvents(
    info: {
      start: Date;
      end: Date;
      startStr: string;
      endStr: string;
      timeZone: string;
    },
    // eslint-disable-next-line no-unused-vars
    successCallback: (events: EventInput[]) => void,
    // eslint-disable-next-line no-unused-vars
    failureCallback: (error: Error) => void
  ): void {
    async function doit() {
      try {
        const res = await calendarEventSources(info.start, info.end);
        successCallback(res as EventInput[]);
      } catch (e) {
        return failureCallback(e as Error);
      }
    }
    doit();
  }

  function renderEventContent(eventInfo: any) {
    return (
      <div style={{ whiteSpace: "normal" }}>
        <b>{eventInfo.timeText !== "00 Uhr" && eventInfo.timeText}</b>
        <br />
        <i>{eventInfo.event.title}</i>
      </div>
    );
  }

  return (
    <Row gutter={8}>
      <Col xs={24} xl={16}>
        <PageHeader
          footer={
            <p>
              <b>Kasse 1</b> und <b>Techniker 1</b> sind am Abend jeweils die <b>Verantwortlichen</b>. Bitte denke daran, rechtzeitig vor
              der Veranstaltung da zu sein!
            </p>
          }
          title="Team"
          extra={[<ButtonWithIcon key="cal" icon="CalendarWeek" text="Kalender" type="default" />]}
        />
        {monate.map((monat) => {
          return (
            <TeamMonatGroup
              key={monat}
              monat={monat}
              veranstaltungen={veranstaltungenNachMonat[monat]}
              usersAsOptions={usersAsOptions || []}
              renderTeam={true}
            />
          );
        })}
      </Col>
      <Col xs={24} xl={8} style={{ zIndex: 0 }}>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          buttonText={{ next: ">", prev: "<" }}
          locales={[deLocale]}
          headerToolbar={{ left: "title", center: "", right: "prev,today,next" }}
          views={{
            month: {
              titleFormat: { month: "short", year: "2-digit" },
              weekNumberFormat: { week: "short" },
              fixedWeekCount: false,
              showNonCurrentDates: false,
              weekNumbers: true,
              weekText: "KW",
            },
          }}
          height="auto"
          events={getEvents}
          eventContent={renderEventContent}
        ></FullCalendar>
      </Col>
    </Row>
  );
}

export default Team;