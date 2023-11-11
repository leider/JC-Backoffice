import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { ConfigProvider, Typography } from "antd";
import React, { useCallback } from "react";
import Vermietung from "jc-shared/vermietung/vermietung.ts";

const { Title } = Typography;
interface HeaderProps {
  veranstaltungOderVermietung: Veranstaltung | Vermietung;
  expanded?: boolean;
}

export default function TeamBlockHeader({ veranstaltungOderVermietung, expanded }: HeaderProps) {
  const isVermietung = useCallback(() => {
    return veranstaltungOderVermietung.isVermietung;
  }, [veranstaltungOderVermietung]);

  const titleStyle = { margin: 0, color: isVermietung() ? "" : "#FFF" };
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
          {!isVermietung() && <T l={5} t={veranstaltungOderVermietung.kopf.presseIn} />}
          <T l={3} t={veranstaltungOderVermietung.kopf.titelMitPrefix} />
        </>
      ) : (
        <>
          <Title level={4} style={titleStyle}>
            {isVermietung() ? `${veranstaltungOderVermietung.kopf.titel} (Vermietung)` : veranstaltungOderVermietung.kopf.titelMitPrefix}
            <br />
            <small>
              <small style={{ fontWeight: 400 }}>
                {veranstaltungOderVermietung.startDatumUhrzeit.wochentagTagMonatShort +
                  (isVermietung() ? "" : `, ${veranstaltungOderVermietung.kopf.ort}`)}
              </small>
            </small>
          </Title>
        </>
      )}
    </ConfigProvider>
  );
}
