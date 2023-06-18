import React, { useEffect, useState } from "react";
import Veranstaltung, { ChangelistItem } from "jc-shared/veranstaltung/veranstaltung";
import { Col, Collapse, ConfigProvider, Divider, Form, notification, Row, Space, theme, Tooltip, Typography } from "antd";
import AdminStaffRow from "@/components/team/AdminStaffRow";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import { areDifferent } from "@/commons/comparingAndTransforming";
import fieldHelpers from "jc-shared/commons/fieldHelpers";
import { ButtonInAdminPanel } from "@/components/Buttons";
import { IconForSmallBlock } from "@/components/Icon";
import { useNavigate } from "react-router-dom";
import { UsersAsOption } from "@/components/team/UserMultiSelect";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { useAuth } from "@/commons/auth";
import { differenceFor } from "jc-shared/commons/compareObjects";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveVeranstaltung } from "@/commons/loader-for-react";
import { SaveButton } from "@/components/colored/JazzButtons";

const { Title } = Typography;
const { Panel } = Collapse;

interface TeamBlockAdminProps {
  veranstaltung: Veranstaltung;
  usersAsOptions: UsersAsOption[];
  initiallyOpen: boolean;
}

interface HeaderProps {
  veranstaltung: Veranstaltung;
  expanded?: boolean;
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
  usersAsOptions: UsersAsOption[];
  veranstaltung: Veranstaltung;
}

function Content({ usersAsOptions, veranstaltung: veranst }: ContentProps) {
  const [form] = Form.useForm();
  const [initialValue, setInitialValue] = useState<any>({});
  const [dirty, setDirty] = useState<boolean>(false);
  const [veranstaltung, setVeranstaltung] = useState<Veranstaltung>(new Veranstaltung());
  const { context } = useAuth();

  const initialize = () => {
    const deepCopy = veranstaltung.toJSON();
    form.setFieldsValue(deepCopy);
    setInitialValue(veranstaltung.toJSON());
    setDirty(false);
  };
  useEffect(initialize, [veranstaltung]);

  useEffect(() => {
    setVeranstaltung(veranst);
  }, [veranst]);

  const dividerStyle = { marginTop: "4px", marginBottom: "4px", fontWeight: 600 };

  const queryClient = useQueryClient();
  const mutateVeranstaltung = useMutation({
    mutationFn: saveVeranstaltung,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veranstaltung", veranstaltung.url] });
      notification.open({
        message: "Speichern erfolgreich",
        description: "Die Veranstaltung wurde gespeichert",
        duration: 5,
      });
    },
  });

  function saveForm() {
    form.validateFields().then(async () => {
      const createLogWithDiff = (diff: string): ChangelistItem => {
        return { zeitpunkt: new DatumUhrzeit().mitUhrzeitNumerisch, bearbeiter: context?.currentUser?.id || "", diff };
      };
      const veranst = form.getFieldsValue(true);
      const diff = differenceFor(initialValue, veranst);
      veranst.changelist.unshift(createLogWithDiff(diff));
      const result = new Veranstaltung(veranst);
      setVeranstaltung(result);
      return mutateVeranstaltung.mutate(result);
    });
  }

  return (
    <Form
      form={form}
      onValuesChange={() => {
        setDirty(areDifferent(initialValue, form.getFieldsValue(true)));
      }}
      onFinish={saveForm}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      size="small"
      colon={false}
      style={{ margin: -12 }}
    >
      <Row justify="end">
        {dirty ? (
          <Space.Compact>
            <SaveButton />
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
            extra={<Extras veranstaltung={veranstaltung} />}
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

function Extras({ veranstaltung }: { veranstaltung: Veranstaltung }) {
  const [tooltip, setTooltip] = useState<string>("");
  const [confirmed, setConfirmed] = useState<boolean>(true);
  const [overallState, setOverallState] = useState<boolean>(true);

  const { token } = theme.useToken();
  const green = token.colorSuccess;
  const red = token.colorError;

  const navigate = useNavigate();

  useEffect(() => {
    const bestaetigt = veranstaltung.kopf.confirmed;
    const presse = veranstaltung.presse.checked;
    const technik = veranstaltung.technik.checked;
    const hotel = veranstaltung.artist.brauchtHotel ? veranstaltung.unterkunft.checked : true;
    setOverallState(presse && technik && hotel);

    let tt: string;
    if (!bestaetigt) {
      tt = "Noch unbestätigt";
    } else {
      const texte = [];
      if (!presse) texte.push("Presse fehlt");
      if (!technik) texte.push("Technik fehlt");
      if (!hotel) texte.push("Hotel fehlt");
      tt = texte.join(", ");
    }
    setConfirmed(bestaetigt);
    setTooltip(tt);
  }, [veranstaltung]);

  const color = overallState ? green : red;
  const colorConf = confirmed ? green : red;

  return (
    <Space style={{ backgroundColor: "#FFF", padding: "0 8px" }}>
      <Tooltip title={confirmed ? "Bestätigt" : "Noch unbestätigt"} color={colorConf}>
        <IconForSmallBlock size={12} iconName={confirmed ? "LockFill" : "UnlockFill"} color={colorConf} />
      </Tooltip>
      {confirmed && (
        <Tooltip title={overallState ? "Alles in Ordnung" : tooltip} color={color}>
          <IconForSmallBlock size={12} iconName={overallState ? "HandThumbsUpFill" : "SignStopFill"} color={color} />
        </Tooltip>
      )}
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
    </Space>
  );
}

export default TeamBlockAdmin;
