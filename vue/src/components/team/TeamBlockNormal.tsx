import React, { useEffect, useState } from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { Col, Collapse, ConfigProvider, Divider, Space, theme, Tooltip } from "antd";
import TeamStaffRow from "@/components/team/TeamStaffRow";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import fieldHelpers from "jc-shared/commons/fieldHelpers";
import { IconForSmallBlock } from "@/components/Icon";
import { useNavigate } from "react-router-dom";
import TeamBlockHeader from "@/components/team/TeamBlockHeader.tsx";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";

interface TeamBlockAdminProps {
  veranstaltung: Veranstaltung;
  usersAsOptions: LabelAndValue[];
  initiallyOpen: boolean;
}

interface ContentProps {
  usersAsOptions: LabelAndValue[];
  veranstaltung: Veranstaltung;
}

function Content({ usersAsOptions, veranstaltung }: ContentProps) {
  const dividerStyle = {
    marginTop: "4px",
    marginBottom: "4px",
    fontWeight: 600,
  };

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
          activeKey={expanded ? veranstaltung.id : ""}
          onChange={() => {
            setExpanded(!expanded);
          }}
          expandIcon={({ isActive }) => (isActive ? <CaretDown color="#fff" /> : <CaretRight color="#fff  " />)}
          items={[
            {
              key: veranstaltung.id || "",
              style: { backgroundColor: color },
              label: <TeamBlockHeader veranstaltung={veranstaltung} expanded={expanded} />,
              extra: (
                <Tooltip title="Vorschau" color={(token as any)["custom-color-concert"]}>
                  <span
                    onClick={(event) => {
                      // If you don't want click extra trigger collapse, you can prevent this:
                      event.stopPropagation();
                      navigate(`/veranstaltung/preview/${veranstaltung.url}`);
                    }}
                  >
                    <Space style={{ backgroundColor: "#FFF", padding: "0 8px" }}>
                      <IconForSmallBlock
                        size={16}
                        iconName={"EyeFill"}
                        color={(token as any)["custom-color-concert"]}
                        style={{
                          margin: "-4px 0",
                        }}
                      />
                    </Space>
                  </span>
                </Tooltip>
              ),
              children: (
                <ConfigProvider theme={{ token: { fontSizeIcon: 10 } }}>
                  <Content veranstaltung={veranstaltung} usersAsOptions={usersAsOptions}></Content>
                </ConfigProvider>
              ),
            },
          ]}
        />
      </Col>
    </ConfigProvider>
  );
}
