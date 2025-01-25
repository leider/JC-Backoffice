import { ConfigProvider, Typography } from "antd";
import React, { useMemo } from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

const { Title } = Typography;
interface HeaderProps {
  veranstaltung: Veranstaltung;
  expanded?: boolean;
}

export default function TeamBlockHeader({ veranstaltung, expanded }: HeaderProps) {
  const { isDarkMode } = useJazzContext();
  const isVermietung = useMemo(() => {
    return veranstaltung.isVermietung;
  }, [veranstaltung]);

  const color = useMemo(() => veranstaltung.colorText(isDarkMode), [isDarkMode, veranstaltung]);

  const titleStyle = { margin: 0, textDecoration: veranstaltung.kopf.abgesagt ? "line-through" : "" };

  function T({ l, t }: { l: 1 | 2 | 4 | 3 | 5 | undefined; t: string }) {
    return (
      <Title level={l} style={titleStyle}>
        {t}
      </Title>
    );
  }

  return (
    <ConfigProvider theme={{ token: { fontSize: 12, lineHeight: 10, colorText: color } }}>
      {expanded ? (
        <>
          <T l={5} t={veranstaltung.datumForDisplayShort} />
          {!isVermietung && <T l={5} t={veranstaltung.kopf.presseIn} />}
          <T l={3} t={veranstaltung.kopf.titel} />
        </>
      ) : (
        <>
          <Title level={4} style={titleStyle}>
            {isVermietung ? `${veranstaltung.kopf.titel} (Vermietung)` : veranstaltung.kopf.titel}
            <br />
            <small>
              <small style={{ fontWeight: 400 }}>
                {veranstaltung.startDatumUhrzeit.wochentagTagMonatShort + (isVermietung ? "" : `, ${veranstaltung.kopf.ort}`)}
              </small>
            </small>
          </Title>
        </>
      )}
    </ConfigProvider>
  );
}
