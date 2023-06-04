import React, { CSSProperties, useEffect, useState } from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { Col, Collapse, ConfigProvider, Divider, Form, Row, Space, theme, Typography } from "antd";
import AdminStaffRow from "@/components/team/AdminStaffRow";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import { areDifferent } from "@/commons/comparingAndTransforming";
import fieldHelpers from "jc-shared/commons/fieldHelpers";
import { ButtonInAdminPanel } from "@/components/Buttons";
import ButtonWithIcon from "@/widgets-react/ButtonWithIcon";
import { IconForSmallBlock } from "@/components/Icon";
import { Link } from "react-router-dom";

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

function Hinweise({ veranstaltung }: { veranstaltung: Veranstaltung }) {
  const [fields, setFields] = useState<{ val: boolean; text: string }[]>([]);
  useEffect(() => {
    const result = [
      { val: veranstaltung.presse.checked, text: "Presse" },
      { val: veranstaltung.technik.checked, text: "Technik" },
    ];
    if (veranstaltung.artist.brauchtHotel) {
      result.push({ val: veranstaltung.unterkunft.checked, text: "Hotel" });
    }
    setFields(result);
  }, [veranstaltung]);
  const { token } = theme.useToken();

  const common: CSSProperties = { color: "white", textAlign: "start", whiteSpace: "nowrap", overflow: "hidden" };

  function NotificationPart({ toggleValue, text, negativeText }: { toggleValue: boolean; text: string; negativeText?: string }) {
    const colStyle = { ...common, backgroundColor: toggleValue ? token.colorSuccessBg : token.colorErrorBg };
    const textStyle = { fontSize: 12, color: toggleValue ? token.colorSuccess : token.colorError };
    const iconStyle = { ...textStyle, margin: "0 2px" };
    return (
      <Col span={5} style={colStyle}>
        {toggleValue ? (
          <IconForSmallBlock size={10} iconName="CheckCircle" style={iconStyle} />
        ) : (
          <IconForSmallBlock size={10} iconName="QuestionCircle" style={iconStyle} />
        )}{" "}
        <Typography.Text style={textStyle}>{toggleValue ? text : negativeText ?? text}</Typography.Text>
      </Col>
    );
  }

  return (
    <Row>
      <NotificationPart key="Offen" toggleValue={veranstaltung.kopf.confirmed} text="Fix" negativeText="Offen" />
      {fields.map((field) => (
        <NotificationPart key={field.text} toggleValue={field.val} text={field.text} />
      ))}
      {fields.length === 2 && (
        <Col span={5} style={{ textAlign: "start" }}>
          <Typography.Text style={{ margin: "0 4px", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden" }}>kein Hotel</Typography.Text>
        </Col>
      )}
      <Col span={4} style={{ textAlign: "center", backgroundColor: token["custom-color-concert"], color: "white" }}>
        <Link to={{ pathname: `/veranstaltung/preview/${veranstaltung.url}` }}>
          <IconForSmallBlock size={14} iconName="Eye" style={{ color: "white" }} />
        </Link>
      </Col>
    </Row>
  );
}
function Header({ veranstaltung, expanded }: HeaderProps) {
  const titleStyle = { margin: 0, color: "#FFF" };
  function T({ l, t }: { l: number; t: string }) {
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
  const [form] = Form.useForm();
  const [initialValue, setInitialValue] = useState<any>({});
  const [dirty, setDirty] = useState<boolean>(false);

  useEffect(() => {
    const deepCopy = veranstaltung.toJSON();
    form.setFieldsValue(deepCopy);
    setInitialValue(veranstaltung.toJSON());
  }, [veranstaltung]);

  const dividerStyle = { marginTop: "4px", marginBottom: "4px", fontWeight: 600 };

  return (
    <Form
      form={form}
      onValuesChange={() => {
        setDirty(areDifferent(initialValue, form.getFieldsValue(true)));
      }}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      size="small"
      colon={false}
      style={{ margin: -12 }}
    >
      <Row justify="end">
        {dirty ? (
          <Space.Compact>
            <ButtonWithIcon icon="CheckSquare" text="Speichern" />
          </Space.Compact>
        ) : (
          <>
            <ButtonInAdminPanel url={veranstaltung.url ?? ""} type="allgemeines"></ButtonInAdminPanel>
            <ButtonInAdminPanel url={veranstaltung.url ?? ""} type="technik"></ButtonInAdminPanel>
            <ButtonInAdminPanel url={veranstaltung.url ?? ""} type="ausgaben"></ButtonInAdminPanel>
            <ButtonInAdminPanel url={veranstaltung.url ?? ""} type="hotel"></ButtonInAdminPanel>
            <ButtonInAdminPanel url={veranstaltung.url ?? ""} type="kasse"></ButtonInAdminPanel>
            <ButtonInAdminPanel url={veranstaltung.url ?? ""} type="presse"></ButtonInAdminPanel>
          </>
        )}
      </Row>
      <div style={{ padding: 8 }}>
        <Divider orientationMargin={0} orientation="left" style={dividerStyle}>
          Kasse
        </Divider>
        <AdminStaffRow usersAsOptions={usersAsOptions} label="Eins:" sectionName="kasseV" />
        <AdminStaffRow usersAsOptions={usersAsOptions} label="Zwei:" sectionName="kasse" />
        <Divider orientationMargin={0} orientation="left" style={dividerStyle}>
          Techniker
        </Divider>
        <AdminStaffRow usersAsOptions={usersAsOptions} label="Eins:" sectionName="technikerV" />
        <AdminStaffRow usersAsOptions={usersAsOptions} label="Zwei:" sectionName="techniker" />
        <Divider orientationMargin={0} orientation="left" style={dividerStyle}>
          Master
        </Divider>
        <AdminStaffRow usersAsOptions={usersAsOptions} label="&nbsp;" sectionName="mod" />
        <Divider orientationMargin={0} orientation="left" style={dividerStyle}>
          Merchandise
        </Divider>
        <AdminStaffRow usersAsOptions={usersAsOptions} label="&nbsp;" sectionName="merchandise" />
      </div>
    </Form>
  );
}

function TeamBlockAdmin({ veranstaltung, usersAsOptions, initiallyOpen }: TeamBlockAdminProps) {
  const { useToken } = theme;
  const { token } = useToken();
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
        <Hinweise veranstaltung={veranstaltung} />
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

export default TeamBlockAdmin;
