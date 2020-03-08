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
          PanelsForUsers(ref="panels", :veranstaltungen="veranstaltungen", :user="user")
    .col-lg-4
      h3 calendar!
  .row
    .col-12
      hr
      .page-header
        h2 Übersicht der Benutzer
  .row
    UserPanel(:currentUser="user", :user="user")
    UserPanel(v-for="u in otherUsers()", :key="u.id", :currentUser="user", :user="u")
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import PanelsForUsers from "./PanelsForUsers.vue";
import User from "../../../lib/users/user";
import { allUsers, currentUser, veranstaltungenForTeam } from "@/commons/loader";
import Accessrights from "../../../lib/commons/accessrights";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import UserPanel from "@/views/user/UserPanel.vue";

@Component({
  components: { UserPanel, PanelsForUsers }
})
export default class Team extends Vue {
  private user: User = new User({});
  private users!: User[];
  private veranstaltungen: Veranstaltung[] = [];

  created() {
    allUsers((users: User[]) => {
      this.users = users;
    });
    currentUser((user: User) => {
      user.accessrights = new Accessrights(user);
      this.user = user;
    });
    veranstaltungenForTeam((veranstaltungen: Veranstaltung[]) => {
      this.veranstaltungen = veranstaltungen;
    });
  }

  get webcalUrl() {
    return `${window.location.origin.replace(/https|http/, "webcal")}/ical/`;
  }

  otherUsers() {
    return this.users?.filter(u => u.id !== this.user.id) || [];
  }
}
</script>
