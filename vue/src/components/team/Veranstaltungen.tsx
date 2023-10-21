import React, { useEffect, useMemo, useState } from "react";
import { allUsers, veranstaltungenForTeam, vermietungenForTeam } from "@/commons/loader.ts";
import { Button, Col, Dropdown, Form, Row, Space } from "antd";
import groupBy from "lodash/groupBy";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { useAuth } from "@/commons/auth";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ButtonWithIcon from "@/widgets/ButtonWithIcon";
import { IconForSmallBlock } from "@/components/Icon";
import { PageHeader } from "@ant-design/pro-layout";
import TeamMonatGroup from "@/components/team/TeamMonatGroup";
import TeamCalendar from "@/components/team/TeamCalendar";
import SingleSelect, { LabelAndValue } from "@/widgets/SingleSelect.tsx";
import _ from "lodash";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { NewButtons } from "@/components/colored/JazzButtons.tsx";

export default function Veranstaltungen() {
  const [search, setSearch] = useSearchParams();
  const PRESSEFILTERS = useMemo(() => ["", "Nur OK", "Nur nicht OK", "Kein finaler Text", "Kein originaler Text"], []);
  const [usersAsOptions, setUsersAsOptions] = useState<LabelAndValue[] | undefined>([]);

  const [form] = Form.useForm();
  async function loadUsers() {
    const users = await allUsers();
    setUsersAsOptions(users.map((user) => ({ label: user.name, value: user.id })));
  }

  const [veranstaltungen, setVeranstaltungen] = useState<Veranstaltung[]>([]);
  const [vermietungen, setVermietungen] = useState<Vermietung[]>([]);
  async function loadVeranstaltungen(period: "zukuenftige" | "vergangene" | "alle") {
    const result = await veranstaltungenForTeam(period);
    setVeranstaltungen(result);
    const verm = await vermietungenForTeam(period);
    setVermietungen(verm);
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
    let filtered = veranstaltungen;
    if (!_.isEmpty(pressefilter)) {
      filtered = filtered.filter((ver) => {
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
          return _.isEmpty(ver.presse.text);
        }
        if (pressefilter === PRESSEFILTERS[4]) {
          // no original text
          return _.isEmpty(ver.presse.originalText);
        }
      });
    }
    const gigOrRent: (Veranstaltung | Vermietung)[] = [];
    gigOrRent.push(...filtered);
    gigOrRent.push(...vermietungen);
    const result = groupBy(
      _.sortBy(gigOrRent, "startDate"),
      (veranst: Veranstaltung | Vermietung) => veranst.startDatumUhrzeit.monatLangJahrKompakt,
    );
    setVeranstaltungenUndVermietungenNachMonat(result);
    setMonate(Object.keys(result));
  }, [pressefilter, veranstaltungen, vermietungen, PRESSEFILTERS]);

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
      <Col xs={{ span: 24, order: 2 }} xl={{ span: 16, order: 1 }}>
        <PageHeader
          title="Veranstaltungen"
          extra={[
            <NewButtons key="newButtons" />,
            <ButtonWithIcon
              key="cal"
              icon="CalendarWeek"
              text="Kalender"
              type="default"
              href={`${window.location.origin.replace(/https|http/, "webcal")}/ical/`}
            />,
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
        />
        <Form form={form} autoComplete="off">
          <Row gutter={8}>
            <Col span={8}>
              <SingleSelect name="Presse" label="Filter Presse" options={PRESSEFILTERS} onChange={setPressefilter} />
            </Col>
          </Row>
        </Form>
        {monate.map((monat) => {
          return (
            <TeamMonatGroup
              key={monat}
              monat={monat}
              veranstaltungenUndVermietungen={veranstaltungenUndVermietungenNachMonat[monat]}
              usersAsOptions={usersAsOptions || []}
              renderTeam={false}
            />
          );
        })}
      </Col>
      <Col xs={{ span: 24, order: 1 }} xl={{ span: 8, order: 2 }} style={{ zIndex: 0 }}>
        <TeamCalendar />
      </Col>
    </Row>
  );
}
