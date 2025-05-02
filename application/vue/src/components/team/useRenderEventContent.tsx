import { Tooltip } from "antd";
import React, { useCallback, useContext } from "react";
import { Link } from "react-router";
import { EventContentArg } from "@fullcalendar/core";
import { GlobalContext } from "@/app/GlobalContext.ts";

export default function useRenderEventContent() {
  const { isTouch } = useContext(GlobalContext);

  return useCallback(
    (eventInfo: EventContentArg) => {
      const showTime = eventInfo.view.getOption("displayEventTime");
      return (
        <Tooltip
          title={
            isTouch ? null : (
              <>
                <span>
                  {eventInfo.timeText !== "00 Uhr" && <b>{eventInfo.timeText} </b>}
                  <i>{eventInfo.event.extendedProps?.tooltip || ""}</i>
                </span>
                <p>{eventInfo.event.title}</p>
              </>
            )
          }
        >
          {eventInfo.event.extendedProps?.linkTo ? (
            <Link style={{ color: eventInfo.event.textColor }} to={eventInfo.event.extendedProps?.linkTo}>
              {showTime ? eventInfo.timeText : ""} {eventInfo.event.title}
            </Link>
          ) : (
            <>
              {showTime ? eventInfo.timeText : ""} {eventInfo.event.title}
            </>
          )}
        </Tooltip>
      );
    },
    [isTouch],
  );
}
