import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import * as React from "react";
import { lazy, useMemo } from "react";
import JazzclubApp from "@/app/JazzclubApp.tsx"; // Keep root (critical)
import { ErrorBoundary } from "@/router/ErrorBoundary.tsx"; // Keep (critical)
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts"; // Pure util
// ProtectedComponent stays static (small wrapper)
import ProtectedComponent from "@/router/ProtectedComponent.tsx";

const Login = lazy(() => import("@/app/Login.tsx"));
const Team = lazy(() => import("@/components/team/Team.tsx"));
const Veranstaltungen = lazy(() => import("@/components/team/Veranstaltungen.tsx"));
const BigKalender = lazy(() => import("@/components/team/BigKalender.tsx"));
const Preview = lazy(() => import("@/components/konzert/preview/Preview.tsx"));
const PreviewVermietung = lazy(() => import("@/components/vermietung/preview/PreviewVermietung.tsx"));
const Info = lazy(() => import("@/components/team/Info.tsx"));
const Users = lazy(() => import("@/components/users/Users.tsx"));
const OrtePage = lazy(() => import("@/components/options/OrtePage.tsx"));
const KalenderPage = lazy(() => import("@/components/options/KalenderPage.tsx"));
const TerminePage = lazy(() => import("@/components/options/TerminePage.tsx"));
const Kassenbericht = lazy(() => import("@/components/options/Kassenbericht.tsx"));
const MailRules = lazy(() => import("@/components/mails/MailRules.tsx"));
const MailingLists = lazy(() => import("@/components/mails/MailingLists.tsx"));
const SendMail = lazy(() => import("@/components/mails/SendMail.tsx"));
const WikiPage = lazy(() => import("@/components/wiki/WikiPage.tsx"));
const WikiSearchresults = lazy(() => import("@/components/wiki/WikiSearchresults.tsx"));
const ImageOverview = lazy(() => import("@/components/options/imageoverview/ImageOverview.tsx"));
const Optionen = lazy(() => import("@/components/options/Optionen.tsx"));
const History = lazy(() => import("@/components/history/History.tsx"));
const Programmheft = lazy(() => import("@/components/programmheft/Programmheft.tsx"));
const VermietungComp = lazy(() => import("@/components/vermietung/VermietungComp.tsx"));
const KonzertComp = lazy(() => import("@/components/konzert/KonzertComp.tsx"));

const naechsterUngeraderMonat = new DatumUhrzeit().naechsterUngeraderMonat;
const programmheftJahrMonat = naechsterUngeraderMonat.format("YYYY/MM");

const routes = [
  {
    element: <JazzclubApp />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: "/", element: <Navigate replace to="/veranstaltungen" /> },

      // ✅ ALL lazy-loaded with Suspense
      { path: "/login", element: <Login /> },
      { path: "/team", element: <Team /> },
      {
        path: "/veranstaltungen",
        element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<Veranstaltungen />} />,
      },
      {
        path: "/kalenderuebersicht",
        element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<BigKalender />} />,
      },
      {
        path: "/konzert/:url",
        element: <ProtectedComponent allowed={["isOrgaTeam", "isAbendkasse"]} component={<KonzertComp />} />,
      },
      { path: "/konzert/preview/:url", element: <Preview /> },
      {
        path: "/vermietung/:url",
        element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<VermietungComp />} />,
      },
      {
        path: "/vermietung/preview/:url",
        element: <ProtectedComponent allowed={["isAbendkasse"]} component={<PreviewVermietung />} />,
      },
      { path: "/team/:monatJahr", element: <Info /> },
      { path: "/users", element: <Users /> },
      {
        path: "/optionen",
        element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<Optionen />} />,
      },
      {
        path: "/orte",
        element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<OrtePage />} />,
      },
      {
        path: "/programmheft/:year/:month",
        element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<Programmheft />} />,
      },
      {
        path: "/programmheft/*",
        element: <Navigate replace to={`/programmheft/${programmheftJahrMonat}`} />,
      },
      {
        path: "/kalender",
        element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<KalenderPage />} />,
      },
      {
        path: "/termine",
        element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<TerminePage />} />,
      },
      {
        path: "/kassenbericht",
        element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<Kassenbericht />} />,
      },
      {
        path: "/imageoverview",
        element: <ProtectedComponent allowed={["isSuperuser"]} component={<ImageOverview />} />,
      },
      {
        path: "/mailrules",
        element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<MailRules />} />,
      },
      {
        path: "/mailinglists",
        element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<MailingLists />} />,
      },
      {
        path: "/sendmail",
        element: <ProtectedComponent allowed={["isOrgaTeam"]} component={<SendMail />} />,
      },
      { path: "/wiki/:subdir/:page?", element: <WikiPage /> },
      { path: "/wiki/searchresults/:searchtext", element: <WikiSearchresults /> },
      {
        path: "/history",
        element: <ProtectedComponent allowed={["isSuperuser"]} component={<History />} />,
      },
      { path: "/*", element: <Navigate replace to="/" /> },
    ],
  },
];

export function JazzRouter() {
  const router = useMemo(() => createBrowserRouter(routes, { basename: "/vue" }), []);
  return <RouterProvider router={router} />;
}
