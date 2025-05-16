import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import * as React from "react";
import { useMemo } from "react";
import JazzclubApp from "@/app/JazzclubApp.tsx";
import { ErrorBoundary } from "@/router/ErrorBoundary.tsx";
import Login from "@/app/Login.tsx";
import Team from "@/components/team/Team.tsx";
import ProtectedComponent from "@/router/ProtectedComponent.tsx";
import Veranstaltungen from "@/components/team/Veranstaltungen.tsx";
import BigKalender from "@/components/team/BigKalender.tsx";
import Preview from "@/components/konzert/preview/Preview.tsx";
import PreviewVermietung from "@/components/vermietung/preview/PreviewVermietung.tsx";
import Info from "@/components/team/Info.tsx";
import Users from "@/components/users/Users.tsx";
import OrtePage from "@/components/options/OrtePage.tsx";
import KalenderPage from "@/components/options/KalenderPage.tsx";
import TerminePage from "@/components/options/TerminePage.tsx";
import Kassenbericht from "@/components/options/Kassenbericht.tsx";
import MailRules from "@/components/mails/MailRules.tsx";
import MailingLists from "@/components/mails/MailingLists.tsx";
import SendMail from "@/components/mails/SendMail.tsx";
import WikiPage from "@/components/wiki/WikiPage.tsx";
import WikiSearchresults from "@/components/wiki/WikiSearchresults.tsx";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import HistoryLazy from "@/components/history/HistoryLazy.tsx";
import ProgrammheftLazy from "@/components/programmheft/ProgrammheftLazy.tsx";
import KonzertCompLazy from "@/components/konzert/KonzertCompLazy.tsx";
import VermietungCompLazy from "@/components/vermietung/VermietungCompLazy.tsx";
import ImageOverview from "@/components/options/imageoverview/ImageOverview.tsx";
import Optionen from "@/components/options/Optionen.tsx";

const naechsterUngeraderMonat = new DatumUhrzeit().naechsterUngeraderMonat;
const programmheftJahrMonat = naechsterUngeraderMonat.format("YYYY/MM");

const routes = [
  {
    element: <JazzclubApp />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: "/", element: <Navigate replace to={{ pathname: "/veranstaltungen" }} /> },
      { path: "/login", element: <Login /> },
      { path: "/team", element: <Team /> },
      { path: "/veranstaltungen", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<Veranstaltungen />} /> },
      { path: "/kalenderuebersicht", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<BigKalender />} /> },
      { path: "/konzert/:url", element: <ProtectedComponent allowed={["isOrgaTeam", "isAbendkasse"]} component={<KonzertCompLazy />} /> },
      { path: "/konzert/preview/:url", element: <Preview /> },
      { path: "/vermietung/:url", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<VermietungCompLazy />} /> },
      {
        path: "/vermietung/preview/:url",
        element: <ProtectedComponent allowed={["isAbendkasse"]} component={<PreviewVermietung />} />,
      },
      { path: "/team/:monatJahr", element: <Info /> },
      { path: "/users", element: <Users /> },
      { path: "/optionen", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<Optionen />} /> },
      { path: "/orte", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<OrtePage />} /> },
      { path: "/programmheft/:year/:month", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<ProgrammheftLazy />} /> },
      { path: "/programmheft/*", element: <Navigate replace to={{ pathname: `/programmheft/${programmheftJahrMonat}` }} /> },
      { path: "/kalender", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<KalenderPage />} /> },
      { path: "/termine", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<TerminePage />} /> },
      { path: "/kassenbericht", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<Kassenbericht />} /> },
      { path: "/imageoverview", element: <ProtectedComponent allowed={["isSuperuser"]} component={<ImageOverview />} /> },
      { path: "/mailrules", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<MailRules />} /> },
      { path: "/mailinglists", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<MailingLists />} /> },
      { path: "/sendmail", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<SendMail />} /> },
      { path: "/wiki/:subdir/:page?", element: <WikiPage /> },
      { path: "/wiki/searchresults/:searchtext", element: <WikiSearchresults /> },
      { path: "/history", element: <ProtectedComponent allowed={["isSuperuser"]} component={<HistoryLazy />} /> },
      { path: "/*", element: <Navigate replace to="/" /> },
    ],
  },
];

export function JazzRouter() {
  const router = useMemo(() => createBrowserRouter(routes, { basename: "/vue" }), []);
  return <RouterProvider router={router} />;
}
