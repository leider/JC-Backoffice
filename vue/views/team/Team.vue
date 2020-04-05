<template lang="pug">
.col-12
  .row
    .col-lg-8
      .row(v-if="!admin")
        .col-12
          .page-header
            .btn-group.float-right
              b-link.btn.btn-light(v-if="user.accessrights && user.accessrights.isOrgaTeam", to="/veranstaltungen/zukuenftige", title="administration")
                i.fas.fa-edit.fa-fw
                | &nbsp;Admin
            h2 Team
            p <b>Kasse 1</b> und <b>Techniker 1</b> sind am Abend jeweils die <b>Verantwortlichen</b>. Bitte denke daran, rechtzeitig vor der Veranstaltung da zu sein!
            p
              a.btn.btn-light(:href="webcalUrl", title="als iCal"): i.far.fa-calendar-alt
              | #{' '} Hiermit kannst Du den Kalender abonnieren.
      .row(v-else)
        .col-12
          .page-header
            .btn-group.float-right
              a.btn.btn-light(href="/veranstaltungen/new", title="Neu"): i.far.fa-file.fa-fw
              a.btn.btn-light(:href="webcalUrl", title="als iCal"): i.far.fa-calendar-alt
              b-dropdown(variant="light", right, :text="zukuenftige ? 'Zukünftige' : 'Vergangene'")
                b-dropdown-item(to="/veranstaltungen/zukuenftige") Zukünftige
                b-dropdown-item(to="/veranstaltungen/vergangene") Vergangene
            h2 Veranstaltungen

      .row
        .col-12
          panels-for-users(ref="panels", :veranstaltungen="veranstaltungen", :user="user", :admin="admin", :users="users")
    .col-lg-4
      jazz-calendar.mt-4
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
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import PanelsForUsers from "./PanelsForUsers.vue";
import User from "../../../lib/users/user";
import { allUsers, currentUser, icals, veranstaltungenForTeam } from "@/commons/loader";
import Accessrights from "../../../lib/commons/accessrights";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import UserPanel from "@/views/user/UserPanel.vue";
import JazzCalendar from "@/views/calendar/JazzCalendar.vue";
import { CalSource } from "../../../lib/optionen/ferienIcals";

@Component({
  components: { JazzCalendar, UserPanel, PanelsForUsers },
})
export default class Team extends Vue {
  @Prop() admin!: boolean;
  @Prop() zukuenftige = true;
  private user: User = new User({});
  private users: User[] = [];
  // noinspection JSMismatchedCollectionQueryUpdate
  private veranstaltungen: Veranstaltung[] = [];
  // noinspection JSMismatchedCollectionQueryUpdate
  private icals: CalSource[] = [];

  created(): void {
    allUsers((users: User[]) => {
      this.users = users;
    });
    currentUser((user: User) => {
      user.accessrights = new Accessrights(user);
      this.user = user;
    });
    icals((icals: CalSource[]) => {
      this.icals = icals;
    });
    this.reloadVeranstaltungen();
  }

  @Watch("admin")
  @Watch("zukuenftige")
  reloadVeranstaltungen(): void {
    document.title = this.admin ? "Veranstaltungen" : "Team";
    veranstaltungenForTeam(this.zukuenftige ? "zukuenftige" : "vergangene", (veranstaltungen: Veranstaltung[]) => {
      this.veranstaltungen = veranstaltungen;
    });
  }

  get webcalUrl(): string {
    return `${window.location.origin.replace(/https|http/, "webcal")}/ical/`;
  }

  otherUsers(): User[] {
    return this.users?.filter((u) => u.id !== this.user.id) || [];
  }
}
</script>
