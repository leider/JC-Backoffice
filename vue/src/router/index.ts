import Vue from "vue";
import VueRouter from "vue-router";
import Team from "../views/team/Team.vue";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Gema from "../views/gema/Gema.vue";
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
import { globals } from "../commons/loader";

Vue.use(VueRouter);

const routes = [
  { path: "/", redirect: "/veranstaltungen" },
  { path: "/login", component: Login },
  { path: "/team", component: Team, props: { admin: false, periode: "zukuenftige" } },
  { path: "/veranstaltungen", redirect: "/veranstaltungen/zukuenftige" },
  { path: "/veranstaltungen/zukuenftige", component: Team, props: { admin: true, periode: "zukuenftige" } },
  { path: "/veranstaltungen/vergangene", component: Team, props: { admin: true, periode: "vergangene" } },
  { path: "/veranstaltungen/alle", component: Team, props: { admin: true, periode: "alle" } },
  { path: "/veranstaltungen/:url", redirect: "/veranstaltungen/:url/allgemeines" },
  { path: "/veranstaltungen/:url/preview", component: Preview, props: true },
  { path: "/veranstaltungen/:url/:tab", component: VeranstaltungView, props: true },
  { path: "/programmheft", redirect: `/programmheft/${new DatumUhrzeit().naechsterUngeraderMonat.fuerKalenderViews}` },
  { path: "/programmheft/:year/:month", component: Programmheft, props: true },
  { path: "/gema", component: Gema },
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
  { path: "*", redirect: "/" },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  if (!to.path.startsWith("/login")) {
    globals.isAuthenticated((isAuth: boolean) => {
      if (!isAuth) {
        next({ path: "/login", query: { originalURL: to.path } });
      } else {
        next();
      }
    });
  } else {
    next();
  }
});

export default router;
