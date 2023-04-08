import React, { useEffect, useState } from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { Button, Col, Collapse, ConfigProvider, Divider, Form, Row, theme, Typography } from "antd";
import AdminStaffRow from "@/components/AdminStaffRow";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import { areDifferent } from "@/commons/comparingAndTransforming";
import fieldHelpers from "jc-shared/commons/fieldHelpers";

const { Title } = Typography;
const { Panel } = Collapse;

interface VeranstaltungCompProps {
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
  return (
    <ConfigProvider
      theme={{
        token: {
          fontSize: 10,
          colorText: textColor,
        },
      }}
    >
      <Title level={5} style={{ margin: 0 }}>
        {veranstaltung.datumForDisplayShort}
      </Title>
      <Title level={5} style={{ margin: 0 }}>
        {veranstaltung.kopf.presseIn}
      </Title>
      <Title level={3} style={{ margin: 0 }}>
        {veranstaltung.kopf.titelMitPrefix}
      </Title>
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

  const { token } = useToken();
  useEffect(() => {
    console.log({ token });
    const deepCopy = veranstaltung.toJSON();
    form.setFieldsValue(deepCopy);
    setInitialValue(veranstaltung.toJSON());
  }, [veranstaltung]);

  return (
    <Form
      form={form}
      onValuesChange={(changedValues, values) => {
        setDirty(areDifferent(initialValue, form.getFieldsValue(true)));
      }}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      size="small"
      colon={false}
    >
      <Row justify="end">{dirty ? <Button type="primary">Speichern</Button> : <></>}</Row>
      <Divider orientation="left">Kasse</Divider>
      <AdminStaffRow usersAsOptions={usersAsOptions} label="Eins:" sectionName="kasseV" />
      <AdminStaffRow usersAsOptions={usersAsOptions} label="Zwei:" sectionName="kasse" />
      <Divider orientation="left">Techniker</Divider>
      <AdminStaffRow usersAsOptions={usersAsOptions} label="Eins:" sectionName="technikerV" />
      <AdminStaffRow usersAsOptions={usersAsOptions} label="Zwei:" sectionName="techniker" />
      <Divider orientation="left">Master</Divider>
      <AdminStaffRow usersAsOptions={usersAsOptions} label="&nbsp;" sectionName="mod" />
      <Divider orientation="left">Merchandise</Divider>
      <AdminStaffRow usersAsOptions={usersAsOptions} label="&nbsp;" sectionName="merchandise" />
    </Form>
  );
}

function VeranstaltungComp({ veranstaltung, usersAsOptions, initiallyOpen }: VeranstaltungCompProps) {
  const { useToken } = theme;
  const { token } = useToken();
  const [color, setColor] = useState<string>("");
  useEffect(() => {
    const code = `custom-color-${fieldHelpers.cssColorCode(veranstaltung.kopf.eventTyp)}`;
    setColor(token[code]);
  }, [veranstaltung]);
  return (
    <Col span={6}>
      <Collapse
        style={{ borderColor: color }}
        size={"small"}
        defaultActiveKey={initiallyOpen && veranstaltung.id}
        expandIcon={({ isActive }) => (isActive ? <CaretDown color="#fff" /> : <CaretRight color="#fff  " />)}
      >
        <Panel style={{ backgroundColor: color }} key={veranstaltung.id} header={<Header veranstaltung={veranstaltung} textColor="#fff" />}>
          <Content veranstaltung={veranstaltung} usersAsOptions={usersAsOptions}></Content>
        </Panel>
      </Collapse>
    </Col>
  );
}

export default VeranstaltungComp;
