import Vue from "vue";
import VueRouter from "vue-router";
import Team from "../views/team/Team.vue";
import Programmheft from "@/views/programmheft/Programmheft.vue";
import DatumUhrzeit from "../../lib/commons/DatumUhrzeit";
import Gema from "@/views/gema/Gema.vue";
import VeranstaltungView from "@/views/veranstaltung/VeranstaltungView.vue";
Vue.use(VueRouter);

const routes = [
  { path: "/", redirect: "/team" },
  { path: "/team", component: Team, props: { admin: false, zukuenftige: true } },
  { path: "/veranstaltungen", redirect: "/veranstaltungen/zukuenftige" },
  { path: "/veranstaltungen/zukuenftige", component: Team, props: { admin: true, zukuenftige: true } },
  { path: "/veranstaltungen/vergangene", component: Team, props: { admin: true, zukuenftige: false } },
  { path: "/veranstaltung/:url", component: VeranstaltungView, props: true },
  { path: "/programmheft", redirect: `/programmheft/${new DatumUhrzeit().naechsterUngeraderMonat.fuerKalenderViews}` },
  { path: "/programmheft/:year/:month", component: Programmheft, props: true },
  { path: "/gema", component: Gema },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
