import React, { useEffect, useState } from "react";
import { allUsers, veranstaltungenForTeam } from "@/commons/loader-for-react";
import { Button, Col, Dropdown, Row, Space } from "antd";
import groupBy from "lodash/groupBy";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { useAuth } from "@/commons/auth";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ButtonWithIcon from "@/widgets-react/ButtonWithIcon";
import { IconForSmallBlock } from "@/components/Icon";
import { PageHeader } from "@ant-design/pro-layout";
import TeamMonatGroup from "@/components/team/TeamMonatGroup";
import TeamCalendar from "@/components/team/TeamCalendar";
import { UsersAsOption } from "@/components/team/UserMultiSelect";

export default function Veranstaltungen() {
  const [search, setSearch] = useSearchParams();

  const [usersAsOptions, setUsersAsOptions] = useState<UsersAsOption[] | undefined>([]);

  async function loadUsers() {
    const users = await allUsers();
    setUsersAsOptions(users.map((user) => ({ label: user.name, value: user.id })));
  }

  const [veranstaltungen, setVeranstaltungen] = useState<Veranstaltung[]>([]);
  async function loadVeranstaltungen(period: "zukuenftige" | "vergangene" | "alle") {
    const result = await veranstaltungenForTeam(period);
    setVeranstaltungen(result);
  }
  useEffect(() => {
    loadUsers();
  }, []);
  const { context } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [veranstaltungenNachMonat, setVeranstaltungenNachMonat] = useState<{ [index: string]: Veranstaltung[] }>({});
  const [monate, setMonate] = useState<string[]>([]);

  document.title = "Veranstaltungen";
  useEffect(() => {
    const result = groupBy(veranstaltungen, (veranst: Veranstaltung) => veranst.startDatumUhrzeit.monatLangJahrKompakt);
    setVeranstaltungenNachMonat(result);
    setMonate(Object.keys(result));
    const accessrights = context?.currentUser.accessrights;
    if (accessrights !== undefined && location.pathname !== "/team" && !accessrights?.isOrgaTeam) {
      navigate("/team");
    }
  }, [veranstaltungen, context]);

  const periods = [
    { label: "Zukünftige", key: "zukuenftige", onClick: () => setSearch({ period: "zukuenftige" }) },
    { label: "Vergangene", key: "vergangene", onClick: () => setSearch({ period: "vergangene" }) },
    { label: "Alle", key: "alle", onClick: () => setSearch({ period: "alle" }) },
  ];
  const [period, setPeriod] = useState<string>("Zukünftige");

  useEffect(() => {
    const periodOfSearch = search.get("period");
    const result = periods.find((each) => each.key === periodOfSearch);
    if (!result) {
      setPeriod(periods[0].label);
      setSearch({ period: periods[0].key });
    } else {
      setPeriod(result.label);
    }
    loadVeranstaltungen((result || periods[0]).key as "zukuenftige" | "vergangene" | "alle");
  }, [search]);

  return (
    <Row gutter={8}>
      <Col xs={24} xl={16}>
        <PageHeader
          title="Veranstaltungen"
          extra={[
            <ButtonWithIcon key="new" icon="FileEarmarkPlus" text="Neu" type="default" onClick={() => navigate("/veranstaltung/new")} />,
            <ButtonWithIcon key="cal" icon="CalendarWeek" text="Kalender" type="default" />,
            <Dropdown
              key="periods"
              menu={{
                items: periods,
              }}
            >
              <Button>
                <Space>
                  {period}
                  <IconForSmallBlock size={8} iconName="ChevronDown" />
                </Space>
              </Button>
            </Dropdown>,
          ]}
        ></PageHeader>
        {monate.map((monat) => {
          return (
            <TeamMonatGroup
              key={monat}
              monat={monat}
              veranstaltungen={veranstaltungenNachMonat[monat]}
              usersAsOptions={usersAsOptions || []}
              renderTeam={false}
            />
          );
        })}
      </Col>
      <Col xs={24} xl={8} style={{ zIndex: 0 }}>
        <TeamCalendar />
      </Col>
    </Row>
  );
}
