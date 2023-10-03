import React, { useEffect, useState } from "react";
import { Col, Collapse, ConfigProvider, Row, Space, theme, Tooltip, Typography } from "antd";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { IconForSmallBlock } from "@/components/Icon.tsx";
import { ButtonInAdminPanel } from "@/components/Buttons.tsx";

const { Panel } = Collapse;

const { Title } = Typography;

function Extras({ vermietung }: { vermietung: Vermietung }) {
  const { token } = theme.useToken();
  const green = token.colorSuccess;
  const red = token.colorError;

  const colorConf = vermietung.confirmed ? green : red;

  return (
    <Space style={{ backgroundColor: "#FFF", padding: "0 8px" }}>
      <Tooltip title={vermietung.confirmed ? "Bestätigt" : "Noch unbestätigt"} color={colorConf}>
        <IconForSmallBlock size={12} iconName={vermietung.confirmed ? "LockFill" : "UnlockFill"} color={colorConf} />
      </Tooltip>
    </Space>
  );
}
interface VermietungHeaderProps {
  vermietung: Vermietung;
  expanded?: boolean;
}

function VermietungHeader({ vermietung, expanded }: VermietungHeaderProps) {
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
          <T l={5} t={vermietung.datumForDisplayShort} />
          <T l={3} t={vermietung.titel} />
        </>
      ) : (
        <>
          <Title level={4} style={titleStyle}>
            {vermietung.titel}
            <br />
            <small>
              <small style={{ fontWeight: 400 }}>{vermietung.startDatumUhrzeit.wochentagTagMonatShort}</small>
            </small>
          </Title>
        </>
      )}
    </ConfigProvider>
  );
}
interface TeamBlockVermietungProps {
  vermietung: Vermietung;
  initiallyOpen: boolean;
}

export default function TeamBlockVermietung({ vermietung, initiallyOpen }: TeamBlockVermietungProps) {
  const [color, setColor] = useState<string>("");
  const { useToken } = theme;
  const { token } = useToken();
  useEffect(() => {
    setColor(token.colorPrimary);
  }, [vermietung]);

  const [expanded, setExpanded] = useState<boolean>();
  useEffect(() => {
    setExpanded(initiallyOpen);
  }, [initiallyOpen]);
  return (
    <ConfigProvider theme={{ token: { fontSizeIcon: expanded ? 18 : 14 } }}>
      <Col xs={24} sm={12} md={8} xxl={6}>
        <Collapse
          style={{ borderColor: color }}
          size={"small"}
          activeKey={expanded ? vermietung.id : ""}
          onChange={() => {
            setExpanded(!expanded);
          }}
          expandIcon={({ isActive }) => (isActive ? <CaretDown color="#fff" /> : <CaretRight color="#fff  " />)}
        >
          <Panel
            className="team-block"
            style={{ backgroundColor: color }}
            key={vermietung.id || ""}
            header={<VermietungHeader vermietung={vermietung} expanded={expanded} />}
            extra={<Extras vermietung={vermietung} />}
          >
            <ConfigProvider theme={{ token: { fontSizeIcon: 10 } }}>
              <Row justify="end">
                <ButtonInAdminPanel url={vermietung.url ?? ""} type="allgemeines" isVermietung></ButtonInAdminPanel>
              </Row>

              <div style={{ padding: 8 }}>
                <h1>Vermietung</h1>
              </div>
            </ConfigProvider>
          </Panel>
        </Collapse>
      </Col>
    </ConfigProvider>
  );
}
