import React, { useEffect, useState } from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { Button, Col, Collapse, Divider, Form, Row, Space, theme, Typography } from "antd";
import AdminStaffRow from "@/components/AdminStaffRow";
import { CaretDown, CaretRight, CashStack, GraphUp, Headphones, HouseDoor, Keyboard, Newspaper } from "react-bootstrap-icons";
import { areDifferent } from "@/commons/comparingAndTransforming";
import fieldHelpers from "jc-shared/commons/fieldHelpers";
import { IconForSmallBlock } from "@/components/Icon";
import { ButtonInAdminPanel } from "@/components/Buttons";

const { Title } = Typography;
const { Panel } = Collapse;

interface TeamBlockAdminProps {
  veranstaltung: Veranstaltung;
  usersAsOptions: { label: string; value: string }[];
  initiallyOpen: boolean;
}

interface HeaderProps {
  veranstaltung: Veranstaltung;
  textColor: string;
}
const { useToken } = theme;

function Header({ veranstaltung, textColor }: HeaderProps) {
  const titleStyle = { margin: 0, color: textColor };
  return (
    <>
      <Title level={5} style={titleStyle}>
        {veranstaltung.datumForDisplayShort}
      </Title>
      <Title level={5} style={titleStyle}>
        {veranstaltung.kopf.presseIn}
      </Title>
      <Title level={3} style={titleStyle}>
        {veranstaltung.kopf.titelMitPrefix}
      </Title>
    </>
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

  const { token } = useToken();

  useEffect(() => {
    const deepCopy = veranstaltung.toJSON();
    form.setFieldsValue(deepCopy);
    setInitialValue(veranstaltung.toJSON());
  }, [veranstaltung]);

  const dividerStyle = { marginTop: "4px", marginBottom: "4px" };

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
    >
      <Row justify="end">
        {dirty ? (
          <Button type="primary">Speichern</Button>
        ) : (
          <Space.Compact size="small">
            <ButtonInAdminPanel type="allgemein"></ButtonInAdminPanel>
            <ButtonInAdminPanel type="technik"></ButtonInAdminPanel>
            <ButtonInAdminPanel type="ausgaben"></ButtonInAdminPanel>
            <ButtonInAdminPanel type="hotel"></ButtonInAdminPanel>
            <ButtonInAdminPanel type="kasse"></ButtonInAdminPanel>
            <ButtonInAdminPanel type="presse"></ButtonInAdminPanel>
          </Space.Compact>
        )}
      </Row>
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
    <Col span={6}>
      <Collapse
        style={{ borderColor: color }}
        size={"small"}
        activeKey={expanded && veranstaltung.id}
        onChange={() => {
          setExpanded(!expanded);
        }}
        expandIcon={({ isActive }) => (isActive ? <CaretDown color="#fff" /> : <CaretRight color="#fff  " />)}
      >
        <Panel style={{ backgroundColor: color }} key={veranstaltung.id} header={<Header veranstaltung={veranstaltung} textColor="#fff" />}>
          <Content veranstaltung={veranstaltung} usersAsOptions={usersAsOptions}></Content>
        </Panel>
      </Collapse>
    </Col>
  );
}

export default TeamBlockAdmin;
