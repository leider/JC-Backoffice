/*
import Team from "../views/team/Team.vue";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import VeranstaltungView from "../views/veranstaltung/VeranstaltungView.vue";
import ImageOverview from "../views/imageOverview/ImageOverview.vue";
import Preview from "../views/veranstaltung/Preview.vue";
import Rundmail from "../views/mails/Rundmail.vue";
import Mailinglisten from "../views/mails/Mailinglisten.vue";
import MailRules from "../views/mails/MailRules.vue";
import ManualMail from "../views/mails/ManualMail.vue";
import Kassenbericht from "../views/options/Kassenbericht.vue";
import Monatsinfos from "../views/team/Monatsinfos.vue";
import TermineUndKalender from "../views/options/TermineUndKalender.vue";
import Optionen from "../views/options/Optionen.vue";
import WikiPage from "../views/wiki/WikiPage.vue";
import WikiSearchresults from "../views/wiki/WikiSearchresults.vue";
import Programmheft from "../views/programmheft/Programmheft.vue";
import Login from "../views/general/Login.vue";
import { globals } from "@/commons/loader";
import Belege from "@/views/belege/Belege.vue";
*/

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
        path: "/veranstaltungen",
        element: <Veranstaltungen />,
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
        path: "/infos/:monatJahr",
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

/*
const routes = [
  { path: "/", redirect: "/veranstaltungen" },
  { path: "/login", component: Login },
  { path: "/team", component: Team, props: { admin: false, periode: "alle" } },
  { path: "/veranstaltungen", redirect: "/veranstaltungen/zukuenftige" },
  { path: "/veranstaltungen/zukuenftige", component: Team, props: { admin: true, periode: "zukuenftige" } },
  { path: "/veranstaltungen/vergangene", component: Team, props: { admin: true, periode: "vergangene" } },
  { path: "/veranstaltungen/alle", component: Team, props: { admin: true, periode: "alle" } },
  { path: "/veranstaltungen/:url", redirect: "/veranstaltungen/:url/allgemeines" },
  { path: "/veranstaltungen/:url/preview", component: Preview, props: true },
  { path: "/veranstaltungen/:url/:tab", component: VeranstaltungView, props: true },
  { path: "/programmheft", redirect: `/programmheft/${new DatumUhrzeit().naechsterUngeraderMonat.fuerKalenderViews}` },
  { path: "/programmheft/:year/:month", component: Programmheft, props: true },
  { path: "/imageoverview", component: ImageOverview },
  { path: "/rundmail", component: Rundmail },
  { path: "/mailinglisten", component: Mailinglisten },
  { path: "/mailrules", component: MailRules },
  { path: "/manualmail", component: ManualMail },
  { path: "/kassenbericht", component: Kassenbericht },
  { path: "/infos/:monat/:tab", component: Monatsinfos, props: true },
  { path: "/terminekalender/:tab", component: TermineUndKalender, props: true },
  { path: "/optionen/:tab", component: Optionen, props: true },
  { path: "/wiki/searchresults/:suchtext", component: WikiSearchresults, props: true },
  { path: "/wiki/:subdir", redirect: "/wiki/:subdir/index" },
  { path: "/wiki/:subdir/:page", component: WikiPage, props: true },
  { path: "/belege", component: Belege },
  { path: "*", redirect: "/" },
];
const router = new VueRouter({
  mode: "history",
  base: import.meta.env.BASE_URL,
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (!to.path.startsWith("/login")) {
    const isAuth = await globals.isAuthenticated();
    if (!isAuth) {
      return next({ path: "/login", query: { originalURL: to.path } });
    }
    return next();
  } else {
    return next();
  }
});

*/
