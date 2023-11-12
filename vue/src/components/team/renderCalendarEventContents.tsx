import { Tooltip } from "antd";
import React from "react";

export function renderEventContent(eventInfo: { timeText: string; event: { title: string } }) {
  return (
    <Tooltip
      title={
        <span>
          {eventInfo.timeText !== "00 Uhr" && <b>{eventInfo.timeText} </b>}
          <i>{eventInfo.event.title}</i>
        </span>
      }
    >
      {eventInfo.event.title}
    </Tooltip>
  );
}
