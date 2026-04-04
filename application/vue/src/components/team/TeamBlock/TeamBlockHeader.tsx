import { ConfigProvider, Typography } from "antd";
import React, { memo, useMemo } from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";

const { Title } = Typography;
interface HeaderProps {
  readonly veranstaltung: Veranstaltung;
}

const UhrzeitOrt = memo(function UhrzeitOrt({ veranstaltung }: { readonly veranstaltung: Veranstaltung }) {
  return (
    <small>
      <small style={{ fontWeight: 400 }}>
        {veranstaltung.startDatumUhrzeit.uhrzeitKompakt +
          " Uhr" +
          (veranstaltung.kopf.ort === "Jazzclub" ? "" : `, ${veranstaltung.kopf.ort}`)}
      </small>
    </small>
  );
});

const headerTheme = { token: { fontSize: 12, lineHeight: 10 } as const };

function TeamBlockHeaderInner({ veranstaltung }: HeaderProps) {
  const color = useMemo(() => veranstaltung.colorText, [veranstaltung]);

  const titleStyle = useMemo(
    () => ({ margin: 0, textDecoration: veranstaltung.kopf.abgesagt ? "line-through" : "" }),
    [veranstaltung.kopf.abgesagt],
  );

  const themeWithColor = useMemo(() => ({ ...headerTheme, token: { ...headerTheme.token, colorText: color } }), [color]);

  return (
    <ConfigProvider theme={themeWithColor}>
      <Title level={3} style={titleStyle}>
        {veranstaltung.kopf.titel}
        <br />
        <UhrzeitOrt veranstaltung={veranstaltung} />
      </Title>
    </ConfigProvider>
  );
}

const TeamBlockHeader = memo(TeamBlockHeaderInner);
export default TeamBlockHeader;
