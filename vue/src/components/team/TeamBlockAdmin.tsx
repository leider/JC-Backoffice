import React, { useEffect, useState } from "react";
import Veranstaltung, { ChangelistItem } from "jc-shared/veranstaltung/veranstaltung";
import { Button, Col, Collapse, ConfigProvider, Divider, Form, notification, Row, Space, Tag, theme, Tooltip } from "antd";
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
import { saveVeranstaltung } from "@/commons/loader.ts";
import { SaveButton } from "@/components/colored/JazzButtons";
import TeamBlockHeader from "@/components/team/TeamBlockHeader.tsx";
import _ from "lodash";

interface TeamBlockAdminProps {
  veranstaltung: Veranstaltung;
  usersAsOptions: UsersAsOption[];
  initiallyOpen: boolean;
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
  const { token } = theme.useToken();
  const navigate = useNavigate();

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

  const dividerStyle = {
    marginTop: "4px",
    marginBottom: "4px",
    fontWeight: 600,
  };

  const queryClient = useQueryClient();

  const mutateVeranstaltung = useMutation({
    mutationFn: saveVeranstaltung,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["veranstaltung", veranstaltung.url],
      });
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
        return {
          zeitpunkt: new DatumUhrzeit().mitUhrzeitNumerisch,
          bearbeiter: context?.currentUser?.id || "",
          diff,
        };
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
            {veranstaltung.artist.brauchtHotel && <ButtonInAdminPanel url={veranstaltung.url ?? ""} type="hotel"></ButtonInAdminPanel>}
            <ButtonInAdminPanel url={veranstaltung.url ?? ""} type="kasse"></ButtonInAdminPanel>
            <ButtonInAdminPanel url={veranstaltung.url ?? ""} type="presse"></ButtonInAdminPanel>
            <ConfigProvider theme={{ token: { colorPrimary: (token as any)["custom-color-concert"] } }}>
              <Tooltip title="Vorschau" color={(token as any)["custom-color-concert"]}>
                <Button
                  icon={<IconForSmallBlock size={16} iconName={"EyeFill"} />}
                  size="middle"
                  type="primary"
                  onClick={() =>
                    navigate({
                      pathname: `/${"veranstaltung/preview"}/${veranstaltung.url}`,
                    })
                  }
                />
              </Tooltip>
            </ConfigProvider>
          </>
        )}
      </Row>
      <Collapse
        items={[
          {
            label: "Mitarbeiter (Klicken zum anzeigen)",
            key: "mitarbeiter",
            children: (
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
            ),
          },
        ]}
      />
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
          activeKey={expanded ? veranstaltung.id : undefined}
          onChange={() => {
            setExpanded(!expanded);
          }}
          expandIcon={({ isActive }) => (isActive ? <CaretDown color="#fff" /> : <CaretRight color="#fff  " />)}
          items={[
            {
              key: veranstaltung.id || "",
              style: { backgroundColor: color },
              className: "team-block",
              label: <TeamBlockHeader veranstaltung={veranstaltung} expanded={expanded} />,
              extra: expanded && <Extras veranstaltung={veranstaltung} />,
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
function Extras({ veranstaltung }: { veranstaltung: Veranstaltung }) {
  const [tagsForTitle, setTagsForTitle] = useState<any[]>([]);

  useEffect(() => {
    function HeaderTag({ label, color }: { label: string; color: boolean }) {
      return (
        <Tag key={label} color={color ? "success" : "error"} style={{ border: 0, paddingLeft: 3, paddingRight: 3 }}>
          {label}
        </Tag>
      );
    }

    const confirmed = veranstaltung.kopf.confirmed;
    const technikOK = veranstaltung.technik.checked;
    const presseOK = veranstaltung.presse.checked;
    const homepage = veranstaltung.kopf.kannAufHomePage;
    const social = veranstaltung.kopf.kannInSocialMedia;
    const abgesagt = veranstaltung.kopf.abgesagt;
    const brauchtHotel = veranstaltung.artist.brauchtHotel;
    const hotel = veranstaltung.unterkunft.bestaetigt;

    const taggies: { label: string; color: boolean }[] = [
      { label: confirmed ? "Bestätigt" : "Unbestätigt", color: confirmed },
      { label: "Technik", color: technikOK },
      { label: "Presse", color: presseOK },
      { label: "Homepage", color: homepage },
      { label: "Social Media", color: social },
    ];
    if (abgesagt) {
      taggies.unshift({ label: "ABGESAGT", color: false });
    }
    if (brauchtHotel) {
      taggies.push({ label: "Hotel", color: hotel });
    }
    setTagsForTitle(taggies.map((tag) => <HeaderTag label={tag.label} color={tag.color}></HeaderTag>));
  }, [veranstaltung]);

  return (
    <ConfigProvider theme={{ token: { fontSize: 11 } }}>
      <div style={{ width: "70px" }}>{tagsForTitle}</div>
    </ConfigProvider>
  );
}

export default TeamBlockAdmin;
