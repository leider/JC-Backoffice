import Vue from "vue";
import VueRouter from "vue-router";
import Team from "../views/team/Team.vue";
Vue.use(VueRouter);

const routes = [
  { path: "/", redirect: "/team" },
  { path: "/team", name: "team", component: Team }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
