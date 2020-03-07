<template lang="pug">
  .col-12
    .row
      .col-lg-8
        .page-header
          .btn-group.float-right
            a.btn.btn-light(v-if="user.accessrights && user.accessrights.isOrgaTeam", href='/veranstaltungen/zukuenftige', title='administration')
              i.fas.fa-edit.fa-fw
              | &nbsp;Admin
          h2 Team
          p <b>Kasse 1</b> und <b>Techniker 1</b> sind am Abend jeweils die <b>Verantwortlichen</b>. Bitte denke daran, rechtzeitig vor der Veranstaltung da zu sein!
          p
            a.btn.btn-light(:href="webcalUrl", title="als iCal"): i.far.fa-calendar-alt
            | #{' '} Hiermit kannst Du den Kalender abonnieren.
        .row
          .col-12
            PanelsForUsers(ref="panels", :veranstaltungen="veranstaltungen")
      .col-lg-4
        h3 calendar!
    .row
      .col-12
        hr
        .page-header
          h2 Übersicht der Benutzer
    .row
      h4 Userpanel
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import PanelsForUsers from "./PanelsForUsers.vue";
import User from "../../../lib/users/user";
import { currentUser, veranstaltungenForTeam } from "@/commons/loader";
import Accessrights from "../../../lib/commons/accessrights";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
Component.registerHooks(["beforeRouteEnter", "beforeRouteLeave", "beforeRouteUpdate"]);
@Component({
  components: { PanelsForUsers }
})
export default class Team extends Vue {
  private user: User = new User({});
  private veranstaltungen: Veranstaltung[] = [];

  created() {
    currentUser((user: any) => {
      user.accessrights = new Accessrights(user);
      this.user = user;
    });
    veranstaltungenForTeam((veranstaltungen: any) => {
      this.veranstaltungen = veranstaltungen;
    });
  }

  get webcalUrl() {
    return `${window.location.origin.replace(/https|http/, "webcal")}/ical/`;
  }
}
</script>
