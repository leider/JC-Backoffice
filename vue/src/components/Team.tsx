import React, { useEffect, useState } from "react";
import { allUsers, calendarEventSources, veranstaltungenForTeam } from "@/commons/loader-for-react";
import { Button, Col, Collapse, Dropdown, MenuProps, Row, Space, Typography } from "antd";
import TeamBlockAdmin from "@/components/TeamBlockAdmin";
import groupBy from "lodash/groupBy";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import { useAuth } from "@/commons/auth";
import { useSearchParams } from "react-router-dom";
import ButtonWithIcon from "@/widgets-react/ButtonWithIcon";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import deLocale from "@fullcalendar/core/locales/de";
import { EventInput } from "@fullcalendar/core";
import { IconForSmallBlock } from "@/components/Icon";

interface MonatGroupProps {
  veranstaltungen: Veranstaltung[];
  usersAsOptions: { label: string; value: string }[];
  monat: string;
}

function MonatGroup({ veranstaltungen, usersAsOptions, monat }: MonatGroupProps) {
  const [expanded, setExpanded] = useState<boolean>(false);
  useEffect(() => {
    const minDatum = veranstaltungen[0].startDatumUhrzeit;
    const jetzt = new DatumUhrzeit();
    setExpanded(minDatum.istVor(jetzt.plus({ monate: 1 })) && minDatum.istNach(jetzt.minus({ monate: 1 })));
  }, [veranstaltungen]);
  return (
    <>
      <Row gutter={8} style={{ backgroundColor: "#d3d3d347" }}>
        <Col span={24}>
          <Collapse
            size={"small"}
            activeKey={expanded ? monat : ""}
            onChange={() => setExpanded(!expanded)}
            expandIcon={({ isActive }) =>
              isActive ? <CaretDown size={14} style={{ color: "#FFF" }} /> : <CaretRight size={14} style={{ color: "#FFF" }} />
            }
          >
            <Collapse.Panel
              key={monat}
              header={
                <Typography.Title level={4} style={{ margin: 0, color: "#FFF" }}>
                  {monat}
                </Typography.Title>
              }
              className="monat-header"
            ></Collapse.Panel>
          </Collapse>
        </Col>
      </Row>
      <Row gutter={[8, 8]} style={{ marginBottom: "18px", backgroundColor: "#d3d3d347" }}>
        {veranstaltungen.map((veranstaltung, index) => (
          <TeamBlockAdmin key={index} veranstaltung={veranstaltung} usersAsOptions={usersAsOptions || []} initiallyOpen={expanded} />
        ))}
      </Row>
    </>
  );
}

function Team() {
  const [search, setSearch] = useSearchParams();

  const [usersAsOptions, setUsersAsOptions] = useState<{ label: string; value: string }[] | undefined>([]);

  async function loadUsers() {
    const users = await allUsers();
    setUsersAsOptions(users.map((user) => ({ label: user.name, value: user.id })));
  }

  const [veranstaltungen, setVeranstaltungen] = useState<Veranstaltung[]>([]);
  async function loadVeranstaltungen(period: "zukuenftige" | "vergangene" | "alle") {
    const result = await veranstaltungenForTeam(period);
    setVeranstaltungen(result);
  }
  useEffect(() => {
    loadUsers();
  }, []);

  const { context } = useAuth();
  const [realadmin, setRealadmin] = useState<boolean>(false);
  useEffect(() => {
    setRealadmin(!!context?.currentUser.accessrights?.isSuperuser);
  }, [context]);

  const [veranstaltungenNachMonat, setVeranstaltungenNachMonat] = useState<{ [index: string]: Veranstaltung[] }>({});
  const [monate, setMonate] = useState<string[]>([]);
  useEffect(() => {
    const filteredVeranstaltungen = veranstaltungen.filter((v) => v.kopf.confirmed || realadmin);
    const result = groupBy(filteredVeranstaltungen, (veranst: Veranstaltung) => veranst.startDatumUhrzeit.monatLangJahrKompakt);
    setVeranstaltungenNachMonat(result);
    setMonate(Object.keys(result));
  }, [veranstaltungen, realadmin]);

  const periods = [
    { label: "Zukünftige", key: "zukuenftige", onClick: () => setSearch({ period: "zukuenftige" }) },
    { label: "Vergangene", key: "vergangene", onClick: () => setSearch({ period: "vergangene" }) },
    { label: "Alle", key: "alle", onClick: () => setSearch({ period: "alle" }) },
  ];
  const [period, setPeriod] = useState<string>("Zukünftige");

  useEffect(() => {
    const periodOfSearch = search.get("period");
    const result = periods.find((each) => each.key === periodOfSearch);
    if (!result) {
      setPeriod(periods[0].label);
      setSearch({ period: periods[0].key });
    } else {
      setPeriod(result.label);
    }
    loadVeranstaltungen((result || periods[0]).key as "zukuenftige" | "vergangene" | "alle");
  }, [search]);

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

  return (
    <Row gutter={8}>
      <Col xs={24} xl={16}>
        <Row justify="space-between" align="bottom">
          <Col>
            <Typography.Title level={1}>Veranstaltungen</Typography.Title>
          </Col>
          <Col>
            <Space>
              <ButtonWithIcon icon="FileEarmarkPlus" text="Neu" type="default" />
              <ButtonWithIcon icon="CalendarWeek" text="Kalender" type="default" />
              <Dropdown
                menu={{
                  items: periods,
                }}
              >
                <Button>
                  <Space>
                    {period}
                    <IconForSmallBlock size={8} iconName="ChevronDown" />
                  </Space>
                </Button>
              </Dropdown>
            </Space>
          </Col>
        </Row>
        {monate.map((monat) => {
          return (
            <MonatGroup
              key={monat}
              monat={monat}
              veranstaltungen={veranstaltungenNachMonat[monat]}
              usersAsOptions={usersAsOptions || []}
            ></MonatGroup>
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
        ></FullCalendar>
      </Col>
    </Row>
  );
}

export default Team;
