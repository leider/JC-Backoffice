import Konzert from "../../../../../shared/konzert/konzert.ts";
import { ConfigProvider, Typography } from "antd";
import React, { useMemo } from "react";
import Vermietung from "jc-shared/vermietung/vermietung.ts";

const { Title } = Typography;
interface HeaderProps {
  veranstaltungOderVermietung: Konzert | Vermietung;
  expanded?: boolean;
}

export default function TeamBlockHeader({ veranstaltungOderVermietung, expanded }: HeaderProps) {
  const isVermietung = useMemo(() => {
    return veranstaltungOderVermietung.isVermietung;
  }, [veranstaltungOderVermietung]);

  const color = veranstaltungOderVermietung.ghost ? "#AAA" : isVermietung ? "" : "#FFF";
  const titleStyle = { margin: 0, color: color };
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
          <T l={5} t={veranstaltungOderVermietung.datumForDisplayShort} />
          {!isVermietung && <T l={5} t={veranstaltungOderVermietung.kopf.presseIn} />}
          <T l={3} t={veranstaltungOderVermietung.kopf.titelMitPrefix} />
        </>
      ) : (
        <>
          <Title level={4} style={titleStyle}>
            {isVermietung ? `${veranstaltungOderVermietung.kopf.titel} (Vermietung)` : veranstaltungOderVermietung.kopf.titelMitPrefix}
            <br />
            <small>
              <small style={{ fontWeight: 400 }}>
                {veranstaltungOderVermietung.startDatumUhrzeit.wochentagTagMonatShort +
                  (isVermietung ? "" : `, ${veranstaltungOderVermietung.kopf.ort}`)}
              </small>
            </small>
          </Title>
        </>
      )}
    </ConfigProvider>
  );
}
