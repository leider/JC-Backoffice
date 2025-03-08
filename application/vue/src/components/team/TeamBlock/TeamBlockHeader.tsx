import { ConfigProvider, Typography } from "antd";
import React, { useMemo } from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

const { Title } = Typography;
interface HeaderProps {
  readonly veranstaltung: Veranstaltung;
  readonly expanded?: boolean;
}

function UhrzeitOrt({ veranstaltung }: { readonly veranstaltung: Veranstaltung }) {
  return (
    <small>
      <small style={{ fontWeight: 400 }}>
        {veranstaltung.startDatumUhrzeit.uhrzeitKompakt +
          " Uhr" +
          (veranstaltung.kopf.ort === "Jazzclub" ? "" : `, ${veranstaltung.kopf.ort}`)}
      </small>
    </small>
  );
}

export default function TeamBlockHeader({ veranstaltung, expanded }: HeaderProps) {
  const { isDarkMode } = useJazzContext();

  const color = useMemo(() => veranstaltung.colorText(isDarkMode), [isDarkMode, veranstaltung]);

  const titleStyle = useMemo(
    () => ({ margin: 0, textDecoration: veranstaltung.kopf.abgesagt ? "line-through" : "" }),
    [veranstaltung.kopf.abgesagt],
  );

  return (
    <ConfigProvider theme={{ token: { fontSize: 12, lineHeight: 10, colorText: color } }}>
      <Title level={expanded ? 3 : 4} style={titleStyle}>
        {veranstaltung.kopf.titel}
        <br />
        <UhrzeitOrt veranstaltung={veranstaltung} />
      </Title>
    </ConfigProvider>
  );
}
