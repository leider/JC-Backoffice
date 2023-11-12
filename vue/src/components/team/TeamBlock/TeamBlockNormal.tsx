import React, { useEffect, useState } from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { Col, Collapse, ConfigProvider, Space, theme, Tooltip } from "antd";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import cssColor from "jc-shared/commons/fieldHelpers.ts";
import { IconForSmallBlock } from "@/components/Icon.tsx";
import { useNavigate } from "react-router-dom";
import TeamBlockHeader from "@/components/team/TeamBlock/TeamBlockHeader.tsx";
import Team from "@/components/team/Team.tsx";
import TeamContent from "@/components/team/TeamBlock/TeamContent.tsx";

interface TeamBlockAdminProps {
  veranstaltung: Veranstaltung;
  initiallyOpen: boolean;
}

export default function TeamBlockNormal({ veranstaltung, initiallyOpen }: TeamBlockAdminProps) {
  const { useToken } = theme;
  const { token } = useToken();
  const navigate = useNavigate();
  const [color, setColor] = useState<string>("");
  useEffect(
    () => {
      const code = `custom-color-${cssColor(veranstaltung.kopf.eventTyp)}`;
      setColor((token as any)[code]);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [veranstaltung],
  );

  const [expanded, setExpanded] = useState<boolean>();
  useEffect(() => {
    setExpanded(initiallyOpen);
  }, [initiallyOpen]);
  return (
    <ConfigProvider theme={{ token: { fontSizeIcon: expanded ? 18 : 14 } }}>
      <Col xs={24} sm={12} lg={8} xl={6} xxl={4}>
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
              label: <TeamBlockHeader veranstaltungOderVermietung={veranstaltung} expanded={expanded} />,
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
                  <TeamContent veranstaltung={veranstaltung} />
                </ConfigProvider>
              ),
            },
          ]}
        />
      </Col>
    </ConfigProvider>
  );
}
