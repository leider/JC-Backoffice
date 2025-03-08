import { Link } from "react-router";
import * as React from "react";
import { useMemo } from "react";
import Accessrights from "jc-shared/user/accessrights.ts";
import { ItemType } from "antd/es/menu/interface";
import map from "lodash/map";
import { MenuIcon } from "@/components/content/menu/MenuIcon.tsx";

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
  const wikisubdirEntries = useMemo(
    () => map(subdirs, (dir) => ({ key: `wiki-${dir}`, label: <Link to={`/wiki/${dir}/`}>{dir}</Link> })),
    [subdirs],
  );

  const veranstaltungMenu = {
    key: menuKeys.veranstaltung,
    icon: <MenuIcon name="Speaker" />,
    label: <Link to="/veranstaltungen">Veranstaltungen</Link>,
  };

  const mailMenu = {
    key: menuKeys.mail,
    icon: <MenuIcon name="EnvelopeFill" />,
    label: "Mails",
    children: [
      {
        key: menuKeys.mailrules,
        icon: <MenuIcon name="ListStars" />,
        label: <Link to="/mailrules">Regeln</Link>,
      },
      {
        key: menuKeys.mailinglists,
        icon: <MenuIcon name="ListCheck" />,
        label: <Link to="/mailinglists">Listen</Link>,
      },
      {
        key: menuKeys.sendmail,
        icon: <MenuIcon name="Send" />,
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
          icon: <MenuIcon name="FuelPump" />,
          label: <Link to="/optionen">Optionen</Link>,
        },
        {
          key: menuKeys.orte,
          icon: <MenuIcon name="Houses" />,
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
          icon: <MenuIcon name="Calendar2Range" />,
          label: <Link to="/kalender">Kalender</Link>,
        },
        {
          key: menuKeys.termine,
          icon: <MenuIcon name="Calendar2Month" />,
          label: <Link to="/termine">Termine</Link>,
        },
      ],
    },
    {
      key: menuKeys.kassenbericht,
      label: <Link to="/kassenbericht">Kassenbericht</Link>,
    },
    {
      key: menuKeys.programmheft,
      icon: <MenuIcon name="Calendar2Check" />,
      label: <Link to="/programmheft/">Programmheft</Link>,
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
    icon: <MenuIcon name="Toggles" />,
    label: "Optionen",
    children: optionenChildren,
  };

  const teamMenu = {
    key: menuKeys.team,
    icon: <MenuIcon name="People" />,
    label: <Link to="/team">Team</Link>,
  };

  const wikiMenu = {
    key: menuKeys.wiki,
    icon: <MenuIcon name="Journals" />,
    label: "Wiki",
    children: wikisubdirEntries,
  };

  return { mailMenu, optionenMenu, teamMenu, veranstaltungMenu, wikiMenu };
}
