import React, { createContext, useEffect, useMemo, useState } from "react";
import { allUsers, veranstaltungenBetweenYYYYMM, veranstaltungenForTeam, vermietungenForTeam } from "@/commons/loader.ts";
import { Button, Col, ConfigProvider, DatePicker, Dropdown, Form, Modal, Row, Space, TimeRangePickerProps } from "antd";
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
import { useForm } from "antd/es/form/Form";
import dayjs, { Dayjs } from "dayjs";
import { asExcelKalk } from "@/commons/utilityFunctions.ts";

export const TeamContext = createContext<{
  veranstaltungenUndVermietungenNachMonat: {
    [index: string]: (Veranstaltung | Vermietung)[];
  };
  usersAsOptions: LabelAndValue[];
} | null>(null);

export default function Veranstaltungen() {
  const [search, setSearch] = useSearchParams();
  const PRESSEFILTERS = useMemo(() => ["", "Nur OK", "Nur nicht OK", "Kein finaler Text", "Kein originaler Text"], []);
  const [usersAsOptions, setUsersAsOptions] = useState<LabelAndValue[]>([]);
  const [isExcelExportOpen, setIsExcelExportOpen] = useState<boolean>(false);

  const [form] = Form.useForm();
  async function loadUsers() {
    const users = await allUsers();
    setUsersAsOptions(users.map((user) => ({ label: user.name, value: user.id })));
  }

  const [alle, setAlle] = useState<(Veranstaltung | Vermietung)[]>([]);
  async function loadAlle(period: "zukuenftige" | "vergangene" | "alle") {
    const result = await veranstaltungenForTeam(period);
    const verm = await vermietungenForTeam(period);
    setAlle(_.sortBy([...result, ...verm], "startDate"));
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
    if (!_.isEmpty(pressefilter)) {
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
          return _.isEmpty(ver.presse.text);
        }
        if (pressefilter === PRESSEFILTERS[4]) {
          // no original text
          return _.isEmpty(ver.presse.originalText);
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
                  <IconForSmallBlock iconName="ChevronDown" />
                </Space>
              </Button>
            </Dropdown>,
          ]}
        />
        <Form form={form} autoComplete="off">
          <Row gutter={8} justify="end">
            <Col span={8}>
              <SingleSelect name="Presse" label="Filter Presse" options={PRESSEFILTERS} onChange={setPressefilter} />
            </Col>
            <Col>
              <SelectRangeForExcelModal isOpen={isExcelExportOpen} setIsOpen={setIsExcelExportOpen} alle={alle} />
              <ConfigProvider theme={{ token: { colorPrimary: "#5900b9" } }}>
                <Button
                  type="primary"
                  icon={<IconForSmallBlock iconName="FileEarmarkSpreadsheet" />}
                  onClick={() => {
                    setIsExcelExportOpen(true);
                  }}
                >
                  Kalkulation (Excel)
                </Button>
              </ConfigProvider>
            </Col>
          </Row>
        </Form>
        <TeamContext.Provider value={{ veranstaltungenUndVermietungenNachMonat, usersAsOptions }}>
          {monate.map((monat) => {
            return <TeamMonatGroup key={monat} monat={monat} />;
          })}
        </TeamContext.Provider>
      </Col>
      <Col xs={{ span: 24, order: 1 }} xl={{ span: 8, order: 2 }} style={{ zIndex: 0 }}>
        <TeamCalendar />
      </Col>
    </Row>
  );
}

function SelectRangeForExcelModal({
  isOpen,
  setIsOpen,
  alle,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  alle: { startDate: Date }[];
}) {
  const [form] = useForm();
  const [first, setFirst] = useState<Dayjs>(dayjs());
  const [last, setLast] = useState<Dayjs>(dayjs());
  useEffect(() => {
    if (alle.length > 0) {
      setFirst(dayjs(alle[0].startDate));
      setLast(dayjs(alle[alle.length - 1].startDate));
    }
  }, [alle]);

  useEffect(() => {
    if (isOpen) {
      form.setFieldValue("zeitraum", [first, last]);
    }
  }, [form, first, last, isOpen]);

  const rangePresets: TimeRangePickerProps["presets"] = [
    { label: "Wie angezeigt", value: [first, last] },
    { label: "Letzte 6 Monate", value: [dayjs().add(-6, "month"), dayjs()] },
    { label: "Letzte 12 Monate", value: [dayjs().add(-12, "month"), dayjs()] },
    { label: "Aktuelles Kalenderjahr", value: [dayjs().month(0), dayjs().month(11)] },
    { label: "Letztes Kalenderjahr", value: [dayjs().month(0).add(-1, "year"), dayjs().month(11).add(-1, "year")] },
  ];

  async function ok() {
    const [from, to] = form.getFieldValue("zeitraum") as [Dayjs, Dayjs];
    const vers = await veranstaltungenBetweenYYYYMM(from.format("YYYYMM"), to.format("YYYYMM"));
    const bestaetigte = vers.filter((ver) => ver.kopf.confirmed);
    asExcelKalk(bestaetigte);
    setIsOpen(false);
  }

  return (
    <Modal open={isOpen} onCancel={() => setIsOpen(false)} onOk={ok} closable={false} maskClosable={false}>
      <Form form={form} onFinish={ok} layout="vertical" autoComplete="off">
        <PageHeader title="Excel Export" />
        <Row gutter={8}>
          <Col span={24}>
            <Form.Item label={<b>Zeitraum für den Export:</b>} name="zeitraum">
              <DatePicker.RangePicker format={"MMM YYYY"} picker="month" presets={rangePresets} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
