import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { ConfigProvider, Typography } from "antd";
import React from "react";

const { Title } = Typography;
interface HeaderProps {
  veranstaltung: Veranstaltung;
  expanded?: boolean;
}

export default function TeamBlockHeader({ veranstaltung, expanded }: HeaderProps) {
  const titleStyle = { margin: 0, color: "#FFF" };
  function T({ l, t }: { l: 1 | 2 | 4 | 3 | 5 | undefined; t: string }) {
    return (
      <Title level={l} style={titleStyle}>
        {t}
      </Title>
    );
  }

  return (
    <ConfigProvider theme={{ token: { fontSize: 12, lineHeight: 10 } }}>
      {expanded ? (
        <>
          <T l={5} t={veranstaltung.datumForDisplayShort} />
          <T l={5} t={veranstaltung.kopf.presseIn} />
          <T l={3} t={veranstaltung.kopf.titelMitPrefix} />
        </>
      ) : (
        <>
          <Title level={4} style={titleStyle}>
            {veranstaltung.kopf.titelMitPrefix}
            <br />
            <small>
              <small style={{ fontWeight: 400 }}>
                {veranstaltung.startDatumUhrzeit.wochentagTagMonatShort}, {veranstaltung.kopf.ort}
              </small>
            </small>
          </Title>
        </>
      )}
    </ConfigProvider>
  );
}
