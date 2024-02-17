import React, { createContext, useEffect, useMemo, useState } from "react";
import { veranstaltungenForTeam, vermietungenForTeam } from "@/commons/loader.ts";
import { Button, Col, Drawer, Dropdown, Form, Row, Space, theme } from "antd";
import groupBy from "lodash/groupBy";
import Konzert from "../../../../shared/konzert/konzert.ts";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import TeamMonatGroup from "@/components/team/TeamMonatGroup";
import TeamCalendar from "@/components/team/TeamCalendar";
import SingleSelect from "@/widgets/SingleSelect.tsx";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { NewButtons } from "@/components/colored/JazzButtons.tsx";
import ExcelMultiExportButton from "@/components/team/ExcelMultiExportButton.tsx";
import sortBy from "lodash/sortBy";
import isEmpty from "lodash/isEmpty";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";
import ButtonIcal from "@/components/team/ButtonIcal.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useQueries } from "@tanstack/react-query";
import { UserWithKann } from "@/components/team/MitarbeiterMultiSelect.tsx";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";

export const TeamContext = createContext<{
  veranstaltungenUndVermietungenNachMonat: {
    [index: string]: (Konzert | Vermietung)[];
  };
  usersAsOptions: UserWithKann[];
}>({ veranstaltungenUndVermietungenNachMonat: {}, usersAsOptions: [] });

export default function Veranstaltungen() {
  useDirtyBlocker(false);
  const [search, setSearch] = useSearchParams();
  const periods = useMemo(() => {
    return [
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
  }, [setSearch]);

  const PRESSEFILTERS = useMemo(() => ["", "Nur OK", "Nur nicht OK", "Kein finaler Text", "Kein originaler Text"], []);

  const [form] = Form.useForm();

  const [period, setPeriod] = useState<string>("Zukünftige");

  const selectedPeriod: "zukuenftige" | "vergangene" | "alle" = useMemo(() => {
    return (search.get("period") || periods[0].key) as "zukuenftige" | "vergangene" | "alle";
  }, [periods, search]);

  useEffect(() => {
    const periodOfSearch = search.get("period");
    const result = periods.find((each) => each.key === periodOfSearch);
    if (!result) {
      setSearch({ period: periods[0].key });
      setPeriod("Zukünftige");
    } else {
      setPeriod(result.label);
    }
  }, [periods, search, setSearch]);

  const queryResult = useQueries({
    queries: [
      { queryKey: ["veranstaltung", selectedPeriod], queryFn: () => veranstaltungenForTeam(selectedPeriod), staleTime: 1000 * 60 * 2 },
      { queryKey: ["vermietung", selectedPeriod], queryFn: () => vermietungenForTeam(selectedPeriod), staleTime: 1000 * 60 * 2 },
    ],
    combine: ([a, b]) => {
      if (a?.data && b?.data) {
        return [...a.data, ...b.data];
      }
      return [];
    },
  });
  const alle = useMemo(() => {
    const additionals = queryResult.flatMap((res) => res.createGhostsForOverview() as (Konzert | Vermietung)[]);

    return sortBy(queryResult.concat(additionals), "startDate");
  }, [queryResult]);

  const { allUsers, currentUser } = useJazzContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [pressefilter, setPressefilter] = useState<string | null>("");

  const usersAsOptions = useMemo(() => allUsers.map((user) => ({ label: user.name, value: user.id, kann: user.kannSections })), [allUsers]);

  const [veranstaltungenUndVermietungenNachMonat, setVeranstaltungenUndVermietungenNachMonat] = useState<{
    [index: string]: (Konzert | Vermietung)[];
  }>({});
  const [monate, setMonate] = useState<string[]>([]);

  document.title = "Veranstaltungen";
  useEffect(() => {
    const accessrights = currentUser.accessrights;
    if (currentUser.id && location.pathname !== "/team" && !accessrights.isOrgaTeam) {
      navigate("/team");
    }
  }, [currentUser.accessrights, currentUser.id, location.pathname, navigate]);

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
    const result = groupBy(filtered, (veranst: Konzert | Vermietung) => veranst.startDatumUhrzeit.monatLangJahrKompakt);
    setVeranstaltungenUndVermietungenNachMonat(result);
    setMonate(Object.keys(result));
  }, [pressefilter, alle, PRESSEFILTERS]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const { useToken } = theme;
  const token = useToken().token;

  return (
    <>
      <Row gutter={8}>
        <Col>
          <JazzPageHeader
            title={
              <Space>
                Veranstaltungen
                <div style={{ marginTop: "-16px" }}>
                  <ButtonWithIcon key="openCal" icon="Calendar2Month" text="Zeigen" onClick={() => setDrawerOpen(true)} />
                </div>
              </Space>
            }
            buttons={[
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
            {currentUser.accessrights.isOrgaTeam && (
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
