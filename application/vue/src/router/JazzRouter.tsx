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
import KonzertComp from "@/components/konzert/KonzertComp.tsx";
import Preview from "@/components/konzert/preview/Preview.tsx";
import VermietungComp from "@/components/vermietung/VermietungComp.tsx";
import PreviewVermietung from "@/components/vermietung/preview/PreviewVermietung.tsx";
import Info from "@/components/team/Info.tsx";
import Users from "@/components/users/Users.tsx";
import Optionen from "@/components/options/Optionen.tsx";
import OrtePage from "@/components/options/OrtePage.tsx";
import Programmheft from "@/components/programmheft/Programmheft.tsx";
import KalenderPage from "@/components/options/KalenderPage.tsx";
import TerminePage from "@/components/options/TerminePage.tsx";
import Kassenbericht from "@/components/options/Kassenbericht.tsx";
import ImageOverview from "@/components/options/imageoverview/ImageOverview.tsx";
import MailRules from "@/components/mails/MailRules.tsx";
import MailingLists from "@/components/mails/MailingLists.tsx";
import SendMail from "@/components/mails/SendMail.tsx";
import WikiPage from "@/components/wiki/WikiPage.tsx";
import WikiSearchresults from "@/components/wiki/WikiSearchresults.tsx";
import { History } from "@/components/history/History.tsx";

const routes = [
  {
    element: <JazzclubApp />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: "/", element: <Navigate to={{ pathname: "/veranstaltungen" }} /> },
      { path: "/login", element: <Login /> },
      { path: "/team", element: <Team /> },
      { path: "/veranstaltungen", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<Veranstaltungen />} /> },
      { path: "/kalenderuebersicht", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<BigKalender />} /> },
      { path: "/konzert/:url", element: <ProtectedComponent allowed={["isOrgaTeam", "isAbendkasse"]} component={<KonzertComp />} /> },
      { path: "/konzert/preview/:url", element: <Preview /> },
      { path: "/vermietung/:url", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<VermietungComp />} /> },
      {
        path: "/vermietung/preview/:url",
        element: <ProtectedComponent allowed={["isAbendkasse"]} component={<PreviewVermietung />} />,
      },
      { path: "/team/:monatJahr", element: <Info /> },
      { path: "/users", element: <Users /> },
      { path: "/optionen", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<Optionen />} /> },
      { path: "/orte", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<OrtePage />} /> },
      { path: "/programmheft/:year/:month", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<Programmheft />} /> },
      { path: "/kalender", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<KalenderPage />} /> },
      { path: "/termine", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<TerminePage />} /> },
      { path: "/kassenbericht", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<Kassenbericht />} /> },
      { path: "/imageoverview", element: <ProtectedComponent allowed={["isSuperuser"]} component={<ImageOverview />} /> },
      { path: "/mailrules", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<MailRules />} /> },
      { path: "/mailinglists", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<MailingLists />} /> },
      { path: "/sendmail", element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<SendMail />} /> },
      { path: "/wiki/:subdir/:page?", element: <WikiPage /> },
      { path: "/wiki/searchresults/:searchtext", element: <WikiSearchresults /> },
      { path: "/history", element: <ProtectedComponent allowed={["isSuperuser"]} component={<History />} /> },
      { path: "/*", element: <Navigate replace to="/" /> },
    ],
  },
];

export function JazzRouter() {
  const router = useMemo(() => createBrowserRouter(routes, { basename: "/vue" }), []);
  return <RouterProvider router={router} />;
}
