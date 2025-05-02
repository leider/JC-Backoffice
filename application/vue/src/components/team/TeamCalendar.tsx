import React, { useCallback, useMemo, useState } from "react";
import { Drawer, theme } from "antd";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";
import ButtonIcal from "@/components/team/ButtonIcal.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { EventInput } from "@fullcalendar/core";
import { calendarEventSources } from "@/rest/loader.ts";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import deLocale from "@fullcalendar/core/locales/de";
import { renderEventContent } from "@/components/team/renderCalendarEventContents.tsx";
import WrapFullCalendar from "@/widgets/calendar/WrapFullCalendar.tsx";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";

export default function TeamCalendar() {
  const { currentUser } = useJazzContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const token = theme.useToken().token;

  const getEvents = useCallback(
    (
      info: {
        start: Date;
        end: Date;
        startStr: string;
        endStr: string;
        timeZone: string;
      },
      successCallback: (events: EventInput[]) => void,
      failureCallback: (error: Error) => void,
    ) => {
      async function doit() {
        try {
          const res = await calendarEventSources({ start: info.start, end: info.end });
          successCallback(res as EventInput[]);
        } catch (e) {
          return failureCallback(e as Error);
        }
      }
      doit();
    },
    [],
  );

  const { lg } = useBreakpoint();
  const initiaDate = useMemo(() => new DatumUhrzeit().minus({ wochen: 2 }).toJSDate, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  return (
    <>
      <ButtonWithIcon alwaysText icon="ChevronLeft" key="openCal" onClick={openDrawer} text={lg ? "Kalender..." : "Kal..."} />
      <Drawer
        closeIcon={
          <div>
            <IconForSmallBlock iconName="ChevronRight" />
          </div>
        }
        extra={
          <>
            {currentUser.accessrights.isOrgaTeam ? (
              <ButtonWithIconAndLink
                color={token.colorPrimary}
                icon="Calendar2Range"
                key="bigcal"
                text="Kalenderübersicht"
                to="/kalenderuebersicht"
                type="default"
              />
            ) : null}
            <ButtonIcal />
          </>
        }
        onClose={closeDrawer}
        open={drawerOpen}
        placement="right"
        size="large"
      >
        <WrapFullCalendar>
          <FullCalendar
            eventContent={renderEventContent}
            eventDisplay="block"
            events={getEvents}
            headerToolbar={{ left: "title", center: "one,four,weeks", right: "prev,today,next" }}
            height="auto"
            initialDate={initiaDate}
            initialView="weeks"
            locales={[deLocale]}
            plugins={[dayGridPlugin, multiMonthPlugin]}
            showNonCurrentDates={false}
            titleFormat={{ year: lg ? "numeric" : "2-digit", month: lg ? "long" : "short" }}
            views={{
              one: {
                weekNumberFormat: { week: "short" },
                fixedWeekCount: false,
                showNonCurrentDates: false,
                weekNumbers: true,
                weekText: "KW",
                buttonText: "1 Monat",
                type: "multiMonth",
                duration: { months: 1 },
              },
              four: {
                weekNumberFormat: { week: "short" },
                fixedWeekCount: false,
                showNonCurrentDates: false,
                weekNumbers: true,
                weekText: "KW",
                buttonText: "4 Monate",
                type: "multiMonth",
                duration: { months: 4 },
              },
              weeks: {
                buttonText: "36 Wochen",
                type: "dayGrid",
                duration: { weeks: 36 },
                displayEventTime: true,
                eventTimeFormat: { hour: "2-digit", minute: "2-digit", meridiem: false },
              },
            }}
          />
        </WrapFullCalendar>
      </Drawer>
    </>
  );
}
