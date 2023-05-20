import React, { useEffect, useState } from "react";
import { allUsers, calendarEventSources, veranstaltungenForTeam } from "@/commons/loader-for-react";
import { Button, Col, Collapse, Dropdown, MenuProps, Row, Space, Typography } from "antd";
import TeamBlockAdmin from "@/components/team/TeamBlockAdmin";
import groupBy from "lodash/groupBy";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import { useAuth } from "@/commons/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import ButtonWithIcon from "@/widgets-react/ButtonWithIcon";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import deLocale from "@fullcalendar/core/locales/de";
import { EventInput } from "@fullcalendar/core";
import { IconForSmallBlock } from "@/components/Icon";
import { PageHeader } from "@ant-design/pro-layout";

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
  const navigate = useNavigate();

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
                <Row justify="space-between" align="bottom">
                  <Col>
                    <Typography.Title level={4} style={{ margin: 0, color: "#FFF" }}>
                      {monat}
                    </Typography.Title>
                  </Col>
                  <Col>
                    <Button
                      ghost
                      icon={<IconForSmallBlock size={12} iconName="FileText" />}
                      size="small"
                      onClick={() => navigate({ pathname: `/infos/${monat}`, search: "tab=pressetexte" })}
                    >
                      Pressetexte
                    </Button>
                    <Button
                      ghost
                      icon={<IconForSmallBlock size={12} iconName="FileSpreadsheet" />}
                      size="small"
                      onClick={() => navigate({ pathname: `/infos/${monat}`, search: "tab=uebersicht" })}
                    >
                      Übersicht
                    </Button>
                  </Col>
                </Row>
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
          title="Veranstaltungen"
          extra={[
            <ButtonWithIcon key="new" icon="FileEarmarkPlus" text="Neu" type="default" />,
            <ButtonWithIcon key="cal" icon="CalendarWeek" text="Kalender" type="default" />,
            <Dropdown
              key="periods"
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
            </Dropdown>,
          ]}
        ></PageHeader>
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
          eventContent={renderEventContent}
        ></FullCalendar>
      </Col>
    </Row>
  );
}

export default Team;
