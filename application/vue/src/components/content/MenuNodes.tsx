import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { Link } from "react-router";
import * as React from "react";
import { useMemo } from "react";
import Accessrights from "jc-shared/user/accessrights.ts";
import { ItemType } from "antd/es/menu/interface";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import map from "lodash/map";

export enum menuKeys {
  veranstaltung = "veranstaltung",
  optionen = "optionen",
  option = "option",
  programmheft = "programmheft",
  orte = "orte",
  kalender = "kalender",
  termine = "termine",
  kassenbericht = "kassenbericht",
  imageoverview = "imageoverview",
  mailrules = "mailrules",
  mailinglists = "mailinglists",
  sendmail = "sendmail",
  mail = "mail",
  team = "team",
  wiki = "wiki",
  users = "users",
  rider = "rider",
  history = "history",
}

export default function useMenuNodes(accessrights: Accessrights, subdirs: string[]) {
  const naechsterUngeraderMonat = useMemo(() => new DatumUhrzeit().naechsterUngeraderMonat, []);
  const programmheftJahrMonat = useMemo(() => naechsterUngeraderMonat.format("YYYY/MM"), [naechsterUngeraderMonat]);

  const wikisubdirEntries = useMemo(
    () => map(subdirs, (dir) => ({ key: `wiki-${dir}`, label: <Link to={`/wiki/${dir}/`}>{dir}</Link> })),
    [subdirs],
  );

  const veranstaltungMenu = {
    key: menuKeys.veranstaltung,
    icon: <IconForSmallBlock iconName="Speaker" />,
    label: <Link to="/veranstaltungen">Veranstaltungen</Link>,
  };

  const mailMenu = {
    key: menuKeys.mail,
    icon: <IconForSmallBlock iconName="EnvelopeFill" />,
    label: "Mails...",
    children: [
      {
        key: menuKeys.mailrules,
        icon: <IconForSmallBlock iconName="ListStars" />,
        label: <Link to="/mailrules">Regeln</Link>,
      },
      {
        key: menuKeys.mailinglists,
        icon: <IconForSmallBlock iconName="ListCheck" />,
        label: <Link to="/mailinglists">Listen</Link>,
      },
      {
        key: menuKeys.sendmail,
        icon: <IconForSmallBlock iconName="Send" />,
        label: <Link to="/sendmail">Mail senden...</Link>,
      },
    ],
  };

  const optionenChildren: ItemType[] = [
    {
      type: "group",
      label: "Optionen und Orte",
      children: [
        {
          key: menuKeys.optionen,
          icon: <IconForSmallBlock iconName="FuelPump" />,
          label: <Link to="/optionen">Optionen</Link>,
        },
        {
          key: menuKeys.orte,
          icon: <IconForSmallBlock iconName="Houses" />,
          label: <Link to="/orte">Orte</Link>,
        },
      ],
    },
    {
      type: "group",
      label: "Kalender und Termine",
      children: [
        {
          key: menuKeys.kalender,
          icon: <IconForSmallBlock iconName="Calendar2Range" />,
          label: <Link to="/kalender">Kalender</Link>,
        },
        {
          key: menuKeys.termine,
          icon: <IconForSmallBlock iconName="Calendar2Month" />,
          label: <Link to="/termine">Termine</Link>,
        },
      ],
    },
    {
      key: menuKeys.kassenbericht,
      label: <Link to="/kassenbericht">Kassenbericht</Link>,
    },
  ];
  if (accessrights.isSuperuser) {
    optionenChildren.push(
      {
        key: menuKeys.imageoverview,
        label: <Link to="/imageoverview">Bilder verwalten</Link>,
      },
      {
        key: menuKeys.history,
        label: <Link to="/history">Änderungsverlauf</Link>,
      },
    );
  }
  const optionenMenu = {
    key: menuKeys.option,
    icon: <IconForSmallBlock iconName="Toggles" />,
    label: "Optionen...",
    children: optionenChildren,
  };

  const teamMenu = {
    key: menuKeys.team,
    icon: <IconForSmallBlock iconName="People" />,
    label: <Link to="/team">Team</Link>,
  };

  const programmheftMenu = {
    key: menuKeys.programmheft,
    icon: <IconForSmallBlock iconName="Calendar2Check" />,
    label: <Link to={`/programmheft/${programmheftJahrMonat}`}>Programmheft</Link>,
  };

  const wikiMenu = {
    key: menuKeys.wiki,
    icon: <IconForSmallBlock iconName="Journals" />,
    label: "Wiki...",
    children: wikisubdirEntries,
  };

  return { mailMenu, optionenMenu, programmheftMenu, teamMenu, veranstaltungMenu, wikiMenu };
}
