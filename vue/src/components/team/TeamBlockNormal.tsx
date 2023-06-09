import React, { useEffect, useState } from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { Col, Collapse, ConfigProvider, Divider, Row, theme, Tooltip, Typography } from "antd";
import TeamStaffRow from "@/components/team/TeamStaffRow";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import fieldHelpers from "jc-shared/commons/fieldHelpers";
import { IconForSmallBlock } from "@/components/Icon";
import { Link, useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Panel } = Collapse;

interface TeamBlockAdminProps {
  veranstaltung: Veranstaltung;
  usersAsOptions: { label: string; value: string }[];
  initiallyOpen: boolean;
}

interface HeaderProps {
  veranstaltung: Veranstaltung;
  expanded?: boolean;
}

function Header({ veranstaltung, expanded }: HeaderProps) {
  const { token } = theme.useToken();
  const titleStyle = { margin: 0, color: "#FFF" };
  function T({ l, t }: { l: number; t: string }) {
    return (
      <Title level={l} style={titleStyle}>
        {t}
      </Title>
    );
  }

  function TitleTwoRows({ l, t }: { l: number; t: string }) {
    return (
      <Row>
        <Col span={20}>
          <Title level={l} style={titleStyle}>
            {t}
          </Title>
        </Col>
        <Col span={4} style={{ textAlign: "center", backgroundColor: token["custom-color-concert"], color: "white" }}>
          <Link to={{ pathname: `/veranstaltung/preview/${veranstaltung.url}` }}>
            <IconForSmallBlock size={14} iconName="Eye" style={{ color: "white" }} />
          </Link>
        </Col>
      </Row>
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
        <Title level={4} style={titleStyle}>
          {veranstaltung.kopf.titelMitPrefix}
          <small>
            <small style={{ fontWeight: 400 }}>
              {" - "}
              {veranstaltung.startDatumUhrzeit.wochentagTagMonat}, {veranstaltung.kopf.ort}
            </small>
          </small>
        </Title>
      )}
    </ConfigProvider>
  );
}

interface ContentProps {
  usersAsOptions: { label: string; value: string }[];
  veranstaltung: Veranstaltung;
}

function Content({ usersAsOptions, veranstaltung }: ContentProps) {
  const dividerStyle = { marginTop: "4px", marginBottom: "4px", fontWeight: 600 };

  return (
    <div style={{ padding: 8 }}>
      <Divider orientationMargin={0} orientation="left" style={dividerStyle}>
        Kasse
      </Divider>
      <TeamStaffRow usersAsOptions={usersAsOptions} label="Eins:" sectionName="kasseV" veranstaltung={veranstaltung} />
      <TeamStaffRow usersAsOptions={usersAsOptions} label="Zwei:" sectionName="kasse" veranstaltung={veranstaltung} />
      <Divider orientationMargin={0} orientation="left" style={dividerStyle}>
        Techniker
      </Divider>
      <TeamStaffRow usersAsOptions={usersAsOptions} label="Eins:" sectionName="technikerV" veranstaltung={veranstaltung} />
      <TeamStaffRow usersAsOptions={usersAsOptions} label="Zwei:" sectionName="techniker" veranstaltung={veranstaltung} />
      <Divider orientationMargin={0} orientation="left" style={dividerStyle}>
        Master
      </Divider>
      <TeamStaffRow usersAsOptions={usersAsOptions} label="&nbsp;" sectionName="mod" veranstaltung={veranstaltung} />
      <Divider orientationMargin={0} orientation="left" style={dividerStyle}>
        Merchandise
      </Divider>
      <TeamStaffRow usersAsOptions={usersAsOptions} label="&nbsp;" sectionName="merchandise" veranstaltung={veranstaltung} />
    </div>
  );
}

export default function TeamBlockNormal({ veranstaltung, usersAsOptions, initiallyOpen }: TeamBlockAdminProps) {
  const { useToken } = theme;
  const { token } = useToken();
  const navigate = useNavigate();
  const [color, setColor] = useState<string>("");
  useEffect(() => {
    const code = `custom-color-${fieldHelpers.cssColorCode(veranstaltung.kopf.eventTyp)}`;
    setColor((token as any)[code]);
  }, [veranstaltung]);

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
          activeKey={expanded && veranstaltung.id}
          onChange={() => {
            setExpanded(!expanded);
          }}
          expandIcon={({ isActive }) => (isActive ? <CaretDown color="#fff" /> : <CaretRight color="#fff  " />)}
        >
          <Panel
            className="team-block"
            style={{ backgroundColor: color }}
            key={veranstaltung.id}
            header={<Header veranstaltung={veranstaltung} expanded={expanded} />}
            extra={
              <Tooltip title="Vorschau" color={token["custom-color-concert"]}>
                <span
                  onClick={(event) => {
                    // If you don't want click extra trigger collapse, you can prevent this:
                    event.stopPropagation();
                    navigate(`/veranstaltung/preview/${veranstaltung.url}`);
                  }}
                >
                  <IconForSmallBlock
                    size={16}
                    iconName={"EyeFill"}
                    color={token["custom-color-concert"]}
                    style={{
                      margin: "-4px 0",
                    }}
                  />
                </span>
              </Tooltip>
            }
          >
            <ConfigProvider theme={{ token: { fontSizeIcon: 10 } }}>
              <Content veranstaltung={veranstaltung} usersAsOptions={usersAsOptions}></Content>
            </ConfigProvider>
          </Panel>
        </Collapse>
      </Col>
    </ConfigProvider>
  );
}
