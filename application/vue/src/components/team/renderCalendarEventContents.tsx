import { Tooltip } from "antd";
import React from "react";
import { Link } from "react-router";
import { EventContentArg } from "@fullcalendar/core";

export function renderEventContent(eventInfo: EventContentArg) {
  const showTime = eventInfo.view.getOption("displayEventTime");
  return (
    <Tooltip
      title={
        <>
          <span>
            {eventInfo.timeText !== "00 Uhr" && <b>{eventInfo.timeText} </b>}
            <i>{eventInfo.event.extendedProps?.tooltip || ""}</i>
          </span>
          <p>{eventInfo.event.title}</p>
        </>
      }
    >
      {eventInfo.event.extendedProps?.linkTo ? (
        <Link to={eventInfo.event.extendedProps?.linkTo} style={{ color: eventInfo.event.textColor }}>
          {showTime ? eventInfo.timeText : ""} {eventInfo.event.title}
        </Link>
      ) : (
        <>
          {showTime ? eventInfo.timeText : ""} {eventInfo.event.title}
        </>
      )}
    </Tooltip>
  );
}
