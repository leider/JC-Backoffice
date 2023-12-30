import React, { createContext, useEffect, useMemo, useState } from "react";
import { allUsers, veranstaltungenForTeam, vermietungenForTeam } from "@/commons/loader.ts";
import { Button, Col, Drawer, Dropdown, Form, Row, Space, theme } from "antd";
import groupBy from "lodash/groupBy";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { useAuth } from "@/commons/authConsts.ts";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { PageHeader } from "@ant-design/pro-layout";
import TeamMonatGroup from "@/components/team/TeamMonatGroup";
import TeamCalendar from "@/components/team/TeamCalendar";
import SingleSelect, { LabelAndValue } from "@/widgets/SingleSelect.tsx";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { NewButtons } from "@/components/colored/JazzButtons.tsx";
import ExcelMultiExportButton from "@/components/team/ExcelMultiExportButton.tsx";
import sortBy from "lodash/sortBy";
import isEmpty from "lodash/isEmpty";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";
import ButtonIcal from "@/components/team/ButtonIcal.tsx";

export const TeamContext = createContext<{
  veranstaltungenUndVermietungenNachMonat: {
    [index: string]: (Veranstaltung | Vermietung)[];
  };
  usersAsOptions: LabelAndValue[];
}>({ veranstaltungenUndVermietungenNachMonat: {}, usersAsOptions: [] });

export default function Veranstaltungen() {
  const [search, setSearch] = useSearchParams();
  const PRESSEFILTERS = useMemo(() => ["", "Nur OK", "Nur nicht OK", "Kein finaler Text", "Kein originaler Text"], []);
  const [usersAsOptions, setUsersAsOptions] = useState<LabelAndValue[]>([]);

  const [form] = Form.useForm();
  async function loadUsers() {
    const users = await allUsers();
    setUsersAsOptions(users.map((user) => ({ label: user.name, value: user.id })));
  }

  const [alle, setAlle] = useState<(Veranstaltung | Vermietung)[]>([]);
  async function loadAlle(period: "zukuenftige" | "vergangene" | "alle") {
    const result = await veranstaltungenForTeam(period);
    const verm = await vermietungenForTeam(period);
    setAlle(sortBy([...result, ...verm], "startDate"));
  }
  useEffect(() => {
    loadUsers();
  }, []);

  const { context } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pressefilter, setPressefilter] = useState<string | null>("");

  const [veranstaltungenUndVermietungenNachMonat, setVeranstaltungenUndVermietungenNachMonat] = useState<{
    [index: string]: (Veranstaltung | Vermietung)[];
  }>({});
  const [monate, setMonate] = useState<string[]>([]);

  document.title = "Veranstaltungen";
  useEffect(() => {
    const accessrights = context?.currentUser.accessrights;
    if (accessrights !== undefined && location.pathname !== "/team" && !accessrights?.isOrgaTeam) {
      navigate("/team");
    }
  }, [context, location.pathname, navigate]);

  useEffect(() => {
    if (alle.length === 0) {
      return;
    }
    let filtered = alle;
    if (!isEmpty(pressefilter)) {
      filtered = filtered.filter((ver) => {
        if (ver.isVermietung && !(ver as Vermietung).brauchtPresse) {
          return true;
        }
        if (pressefilter === PRESSEFILTERS[1]) {
          // OK
          return ver.presse.checked;
        }
        if (pressefilter === PRESSEFILTERS[2]) {
          // not OK
          return !ver.presse.checked;
        }
        if (pressefilter === PRESSEFILTERS[3]) {
          // no final text
          return isEmpty(ver.presse.text);
        }
        if (pressefilter === PRESSEFILTERS[4]) {
          // no original text
          return isEmpty(ver.presse.originalText);
        }
      });
    }
    const result = groupBy(filtered, (veranst: Veranstaltung | Vermietung) => veranst.startDatumUhrzeit.monatLangJahrKompakt);
    setVeranstaltungenUndVermietungenNachMonat(result);
    setMonate(Object.keys(result));
  }, [pressefilter, alle, PRESSEFILTERS]);

  const periods = [
    {
      label: "Zukünftige",
      key: "zukuenftige",
      onClick: () => setSearch({ period: "zukuenftige" }),
    },
    {
      label: "Vergangene",
      key: "vergangene",
      onClick: () => setSearch({ period: "vergangene" }),
    },
    {
      label: "Alle",
      key: "alle",
      onClick: () => setSearch({ period: "alle" }),
    },
  ];
  const [period, setPeriod] = useState<string>("Zukünftige");

  useEffect(
    () => {
      const periodOfSearch = search.get("period");
      const result = periods.find((each) => each.key === periodOfSearch);
      if (!result) {
        setSearch({ period: periods[0].key });
      } else {
        setPeriod(result.label);
        loadAlle((result || periods[0]).key as "zukuenftige" | "vergangene" | "alle");
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [search],
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const { useToken } = theme;
  const token = useToken().token;

  return (
    <>
      <Row gutter={8}>
        <Col>
          <PageHeader
            title={
              <Space>
                Veranstaltungen
                <div style={{ marginTop: "-16px" }}>
                  <ButtonWithIcon key="openCal" icon="Calendar2Month" text="Zeigen" onClick={() => setDrawerOpen(true)} />
                </div>
              </Space>
            }
            extra={[
              <ExcelMultiExportButton key="excel" alle={alle}></ExcelMultiExportButton>,
              <NewButtons key="newButtons" />,
              <Dropdown
                key="periods"
                menu={{
                  items: periods,
                }}
              >
                <Button>
                  <Space>
                    {period}
                    <IconForSmallBlock iconName="ChevronDown" />
                  </Space>
                </Button>
              </Dropdown>,
            ]}
          />
          <Form form={form} autoComplete="off">
            <Row gutter={8} style={{ marginLeft: 0 }}>
              <Col xs={24} sm={8} lg={6}>
                <SingleSelect name="Presse" label="Filter Presse" options={PRESSEFILTERS} onChange={setPressefilter} />
              </Col>
            </Row>
          </Form>
          <TeamContext.Provider value={{ veranstaltungenUndVermietungenNachMonat, usersAsOptions }}>
            {monate.map((monat) => {
              return <TeamMonatGroup key={monat} monat={monat} />;
            })}
          </TeamContext.Provider>
        </Col>
      </Row>
      <Drawer
        extra={
          <>
            {context?.currentUser?.accessrights?.isOrgaTeam && (
              <ButtonWithIconAndLink
                key="bigcal"
                icon="Calendar2Range"
                color={token.colorPrimary}
                text="Kalenderübersicht"
                type="default"
                to="/kalenderuebersicht"
              />
            )}
            <ButtonIcal />
          </>
        }
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        size="large"
      >
        <TeamCalendar />
      </Drawer>
    </>
  );
}
