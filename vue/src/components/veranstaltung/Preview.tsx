import { Button, Col, ConfigProvider, Divider, List, Row, Tooltip } from "antd";
import React, { CSSProperties, useEffect, useMemo, useState } from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { PageHeader } from "@ant-design/pro-layout";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { allUsers, riderFor, veranstaltungForUrl } from "@/commons/loader.ts";
import User from "jc-shared/user/user";
import { useColorsAndIconsForSections } from "@/components/colorsIconsForSections";
import { IconForSmallBlock } from "@/components/Icon";
import { PressePreview } from "@/components/veranstaltung/presse/PressePreview";
import renderer from "jc-shared/commons/renderer";
import Staff, { StaffType } from "jc-shared/veranstaltung/staff";
import Kontakt from "jc-shared/veranstaltung/kontakt";
import { useAuth } from "@/commons/authConsts.ts";
import { useTypeCustomColors } from "@/components/createTokenBasedStyles.ts";
import { Rider } from "jc-shared/rider/rider.ts";

function ButtonAbendkasse({ callback }: { callback: () => void }) {
  const { color, icon } = useColorsAndIconsForSections("kasse");
  const { context } = useAuth();
  if (!context?.currentUser.accessrights?.isAbendkasse) {
    return;
  }
  return (
    <ConfigProvider theme={{ token: { colorPrimary: color() } }}>
      <Tooltip title="Abendkasse" color={color()}>
        <Button block icon={<IconForSmallBlock size={16} iconName={icon()} />} type="primary" onClick={callback}>
          Abendkasse
        </Button>
      </Tooltip>
    </ConfigProvider>
  );
}

function StaffList({
  header,
  notNeeded,
  parts,
  staff,
  theUsers,
}: {
  header: string;
  staff: Staff;
  notNeeded: boolean;
  parts: { verant?: StaffType; normal?: StaffType };
  theUsers: User[];
}) {
  function usersForNames(names: string[]) {
    return (theUsers || []).filter((user) => names.includes(user.id));
  }

  let names: { user: User; bold: boolean }[] = [];
  if (parts.verant) {
    names = names.concat(usersForNames(staff[parts.verant]).map((user) => ({ user, bold: true })));
  }
  if (parts.normal) {
    names = names.concat(usersForNames(staff[parts.normal]).map((user) => ({ user, bold: false })));
  }
  if (names.length === 0) {
    names.push({ user: new User({ name: "n.a." }), bold: false });
  }

  function renderItem(item: { user: User; bold: boolean }) {
    function renderUser(user: User) {
      return (
        <>
          {user.name} <a href={`tel:${user.tel}`}>{user.tel}</a> <a href={`mailto:${user.email}`}>{user.email}</a>
        </>
      );
    }
    return <List.Item>{item.bold ? <b>{renderUser(item.user)}</b> : <span>{renderUser(item.user)}</span>}</List.Item>;
  }

  return !notNeeded && <List size="small" header={<b>{header}:</b>} dataSource={names} renderItem={renderItem} />;
}

export default function Preview() {
  const { url } = useParams();
  const navigate = useNavigate();
  const veranst = useQuery({
    queryKey: ["veranstaltung", url],
    queryFn: () => veranstaltungForUrl(url || ""),
  });
  const theUsers = useQuery({ queryKey: ["users"], queryFn: () => allUsers() });
  const riderQuery = useQuery({ queryKey: ["rider", "url"], queryFn: () => riderFor(url || "") });

  const [veranstaltung, setVeranstaltung] = useState<Veranstaltung>(new Veranstaltung());
  const [users, setUsers] = useState<User[]>([]);
  const [rider, setRider] = useState<Rider>(new Rider());

  const printref = useMemo(() => {
    return window.location.href.replace("vue/veranstaltung/preview", "pdf/rider");
  }, []);

  useEffect(() => {
    if (veranst.data) {
      setVeranstaltung(veranst.data);
    }
  }, [veranst.data]);

  useEffect(() => {
    if (theUsers.data) {
      setUsers(theUsers.data);
    }
  }, [theUsers.data]);

  useEffect(() => {
    if (riderQuery.data) {
      setRider(riderQuery.data);
    }
  }, [riderQuery.data]);

  const { colorForEventTyp } = useTypeCustomColors();

  const typeColor = colorForEventTyp(veranstaltung.kopf.eventTyp);
  const titleStyle: CSSProperties = { color: typeColor, whiteSpace: "normal" };
  return (
    <div>
      <PageHeader
        title={
          <span style={titleStyle}>
            {veranstaltung.kopf.titelMitPrefix} {veranstaltung.kopf.presseInEcht}
          </span>
        }
        subTitle={<span style={titleStyle}>{veranstaltung.datumForDisplayShort}</span>}
      />
      <Row gutter={12}>
        <Col xs={24} lg={12}>
          <CollapsibleForVeranstaltung suffix="staff" label="Staff">
            <Row gutter={12}>
              <Col span={24}>
                <StaffList
                  header="Master"
                  staff={veranstaltung.staff}
                  parts={{ verant: "mod" }}
                  notNeeded={veranstaltung.staff.modNotNeeded}
                  theUsers={users}
                />
                <StaffList
                  header="Kasse"
                  staff={veranstaltung.staff}
                  parts={{ verant: "kasseV", normal: "kasse" }}
                  notNeeded={veranstaltung.staff.kasseNotNeeded && veranstaltung.staff.kasseVNotNeeded}
                  theUsers={users}
                />
                <StaffList
                  header="Technik"
                  staff={veranstaltung.staff}
                  parts={{ verant: "technikerV", normal: "techniker" }}
                  notNeeded={veranstaltung.staff.technikerNotNeeded && veranstaltung.staff.technikerVNotNeeded}
                  theUsers={users}
                />
                <StaffList
                  header="Merchandise"
                  staff={veranstaltung.staff}
                  parts={{ normal: "merchandise" }}
                  notNeeded={veranstaltung.staff.merchandiseNotNeeded}
                  theUsers={users}
                />
              </Col>
            </Row>
          </CollapsibleForVeranstaltung>
          <CollapsibleForVeranstaltung suffix="kasse" label="Eintritt und Abendkasse">
            <Row gutter={12}>
              <Col span={24}>
                {veranstaltung.eintrittspreise.frei ? (
                  <p>Freier Eintritt (Sammelbox)</p>
                ) : (
                  <Row gutter={12}>
                    <Col span={8}>
                      <b>{veranstaltung.eintrittspreise.regulaer},00 €</b>
                    </Col>
                    <Col span={8}>
                      <b>{veranstaltung.eintrittspreise.ermaessigt},00 €</b>
                    </Col>
                    <Col span={8}>
                      <b>{veranstaltung.eintrittspreise.mitglied},00 €</b>
                    </Col>
                  </Row>
                )}
                <Row gutter={12}>
                  <Col span={10} offset={14}>
                    <ButtonAbendkasse
                      callback={() =>
                        navigate({
                          pathname: `/veranstaltung/${url}`,
                          search: "page=kasse",
                        })
                      }
                    />
                  </Col>{" "}
                </Row>
              </Col>
            </Row>
          </CollapsibleForVeranstaltung>
          {veranstaltung.kopf.beschreibung?.trim() && (
            <CollapsibleForVeranstaltung suffix="allgemeines" label="Informationen">
              <div
                dangerouslySetInnerHTML={{
                  __html: renderer.render(veranstaltung.kopf.beschreibung),
                }}
              />
            </CollapsibleForVeranstaltung>
          )}
          <CollapsibleForVeranstaltung suffix="technik" label="Technik">
            <Row gutter={12}>
              {veranstaltung.technik.fluegel && (
                <Col span={24}>
                  <b>Flügel stimmen!</b>
                  <Divider />
                </Col>
              )}
              {veranstaltung.technik.backlineJazzclub.length > 0 && (
                <Col span={24}>
                  <b>Backline Jazzclub:</b>
                  <ul>
                    {veranstaltung.technik.backlineJazzclub.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <Divider />
                </Col>
              )}
              {veranstaltung.technik.backlineRockshop.length > 0 && (
                <Col span={24}>
                  <b>Backline Rockshop:</b>
                  <ul>
                    {veranstaltung.technik.backlineRockshop.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <Divider />
                </Col>
              )}
              {veranstaltung.technik.dateirider.length > 0 && (
                <Col span={24}>
                  <b>Dateien:</b>
                  <ul>
                    {veranstaltung.technik.dateirider.map((item) => (
                      <li key={item}>
                        <a href={`/files/${item}`} target="_blank">
                          {item}
                        </a>
                      </li>
                    ))}
                    {rider?.boxes.length > 0 && (
                      <li key="riderurl">
                        <a href={printref} target="_blank">
                          {`Rider-${url}.pdf`}
                        </a>
                      </li>
                    )}
                  </ul>
                </Col>
              )}
            </Row>
          </CollapsibleForVeranstaltung>
        </Col>
        <Col xs={24} lg={12}>
          <CollapsibleForVeranstaltung suffix="presse" label="Pressetext">
            <PressePreview veranstaltung={veranstaltung} />
          </CollapsibleForVeranstaltung>
          {veranstaltung.agentur.name && (
            <CollapsibleForVeranstaltung suffix="allgemeines" label="Agentur">
              <AddressBlock kontakt={veranstaltung.agentur} />
            </CollapsibleForVeranstaltung>
          )}
          {veranstaltung.artist.brauchtHotel && veranstaltung.unterkunft.anzahlZimmer > 0 && (
            <CollapsibleForVeranstaltung
              suffix="hotel"
              label={`Hotel: ${veranstaltung.unterkunft.anzahlZimmer} Zimmer für ${veranstaltung.unterkunft.anzNacht}`}
            >
              <AddressBlock kontakt={veranstaltung.hotel} />
            </CollapsibleForVeranstaltung>
          )}
        </Col>
      </Row>
    </div>
  );
}

function AddressBlock({ kontakt }: { kontakt: Kontakt }) {
  const lines = kontakt.adresse.match(/[^\r\n]+/g) || [];
  return (
    <address>
      <strong>{kontakt.name}</strong>
      <br />
      {lines.map((line) => (
        <span key={line}>
          {line} <br />
        </span>
      ))}
      Tel.: <a href={`tel:${kontakt.telefon}`}> {kontakt.telefon}</a>
      <br />
      E-Mail: <a href={`mailto:${kontakt.email}`}> {kontakt.email}</a>
    </address>
  );
}
