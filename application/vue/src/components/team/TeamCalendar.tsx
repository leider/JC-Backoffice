import React, { useCallback, useState } from "react";
import { Drawer, theme } from "antd";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";
import ButtonIcal from "@/components/team/ButtonIcal.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { EventInput } from "@fullcalendar/core";
import { calendarEventSources } from "@/commons/loader.ts";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import deLocale from "@fullcalendar/core/locales/de";
import { renderEventContent } from "@/components/team/renderCalendarEventContents.tsx";

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
          const res = await calendarEventSources(info.start, info.end);
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
  return (
    <>
      <ButtonWithIcon
        alwaysText
        key="openCal"
        icon="ChevronLeft"
        text={lg ? "Kalender..." : "Kal..."}
        onClick={() => setDrawerOpen(true)}
      />
      <Drawer
        extra={
          <>
            {currentUser.accessrights.isOrgaTeam && (
              <ButtonWithIconAndLink
                key="bigcal"
                icon="Calendar2Range"
                color={token.colorPrimary}
                text="Kalenderübersicht"
                type="default"
                to="/kalenderuebersicht"
              />
            )}
            <ButtonIcal />
          </>
        }
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        size="large"
        closeIcon="Schließen"
      >
        <FullCalendar
          plugins={[dayGridPlugin, multiMonthPlugin]}
          initialView="one"
          locales={[deLocale]}
          headerToolbar={{ left: "title", center: "one,four,weeks", right: "prev,today,next" }}
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
            },
          }}
          height="auto"
          events={getEvents}
          eventContent={renderEventContent}
          eventDisplay="block"
          showNonCurrentDates={false}
        />
      </Drawer>
    </>
  );
}
