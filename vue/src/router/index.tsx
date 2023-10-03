import { Navigate, RouteObject } from "react-router-dom";
import JazzclubApp from "../JazzclubApp";
import * as React from "react";
import Team from "@/components/team/Team";
import VeranstaltungComp from "@/components/veranstaltung/VeranstaltungComp";
import Login from "@/components/Login";
import Optionen from "@/components/options/Optionen";
import Info from "@/components/team/Info";
import Preview from "@/components/veranstaltung/Preview";
import Veranstaltungen from "@/components/team/Veranstaltungen";
import Users from "@/components/users/Users";
import OrtePage from "@/components/options/OrtePage";
import KalenderPage from "@/components/options/KalenderPage";
import TerminePage from "@/components/options/TerminePage";
import MailRules from "@/components/mails/MailRules";
import MailingLists from "@/components/mails/MailingLists";
import SendMail from "@/components/mails/SendMail";
import Belege from "@/components/belege/Belege";
import WikiPage from "@/components/wiki/WikiPage";
import WikiSearchresults from "@/components/wiki/WikiSearchresults";
import Programmheft from "@/components/programmheft/Programmheft";
import Kassenbericht from "@/components/options/Kassenbericht";
import ImageOverview from "@/components/options/ImageOverview";

export const routes: RouteObject[] = [
  {
    element: <JazzclubApp />,
    children: [
      {
        path: "/",
        element: <Navigate to={{ pathname: "/veranstaltungen", search: "zukuenftige" }} />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/team",
        element: <Team />,
      },
      {
        path: "/teamseite",
        element: <Navigate replace to="/team" />,
      },
      {
        path: "/veranstaltungen",
        element: <Veranstaltungen />,
      },
      {
        path: "/veranstaltungen/:url",
        element: <VeranstaltungComp />,
      },
      {
        path: "/veranstaltungen/preview/:url",
        element: <Preview />,
      },
      {
        path: "/veranstaltung/:url",
        element: <VeranstaltungComp />,
      },
      {
        path: "/veranstaltung/preview/:url",
        element: <Preview />,
      },
      {
        path: "/team/:monatJahr",
        element: <Info />,
      },
      {
        path: "/users",
        element: <Users />,
      },
      {
        path: "/optionen",
        element: <Optionen />,
      },
      {
        path: "/orte",
        element: <OrtePage />,
      },
      {
        path: "/programmheft/:year?/:month?",
        element: <Programmheft />,
      },
      {
        path: "/kalender",
        element: <KalenderPage />,
      },
      {
        path: "/termine",
        element: <TerminePage />,
      },
      {
        path: "/kassenbericht",
        element: <Kassenbericht />,
      },
      {
        path: "/imageoverview",
        element: <ImageOverview />,
      },
      {
        path: "/mailrules",
        element: <MailRules />,
      },
      {
        path: "/mailinglists",
        element: <MailingLists />,
      },
      {
        path: "/sendmail",
        element: <SendMail />,
      },
      {
        path: "/belege",
        element: <Belege />,
      },
      {
        path: "/wiki/:subdir/:page?",
        element: <WikiPage />,
      },
      {
        path: "/wiki/searchresults/:searchtext",
        element: <WikiSearchresults />,
      },
    ],
  },
];
