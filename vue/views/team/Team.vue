<template lang="pug">
.col-12
  .row
    .col-lg-12
      b-tabs(active-nav-item-class="font-weight-bold text-uppercase")
        b-tab(:title="admin ? 'Veranstaltungen' : 'Team'")
          .row
            .col-lg-8
              .row
                .col-12
                  b-overlay(:show="loading")
                    div(v-if="!admin")
                      .btn-group.float-right
                        b-link.btn.btn-light(
                          v-if="user.accessrights && user.accessrights.isOrgaTeam",
                          to="/veranstaltungen/zukuenftige",
                          title="administration"
                        )
                          b-icon-pencil-square
                          | &nbsp;Admin
                      p <b>Kasse 1</b> und <b>Techniker 1</b> sind am Abend jeweils die <b>Verantwortlichen</b>. Bitte denke daran, rechtzeitig vor der Veranstaltung da zu sein!
                      p
                        a.btn.btn-light(:href="webcalUrl", title="als iCal"): b-icon-calendar3
                        | #{' '} Hiermit kannst Du den Kalender abonnieren.
                    div(v-else)
                      .btn-group.float-right
                        b-button.btn-light(to="/veranstaltungen/new", title="Neu"): b-icon-file-earmark
                        a.btn.btn-light(:href="webcalUrl", title="als iCal"): b-icon-calendar3
                        b-dropdown(variant="light", right, :text="zukuenftige ? 'Zukünftige' : 'Vergangene'")
                          b-dropdown-item(to="/veranstaltungen/zukuenftige") Zukünftige
                          b-dropdown-item(to="/veranstaltungen/vergangene") Vergangene
                    template(v-slot:overlay)
                      p.text-center Lade Daten...

              .row
                .col-12
                  panels-for-monat(
                    v-for="monat in monate",
                    :key="monat",
                    :monat="monat",
                    :veranstaltungen="veranstaltungenNachMonat[monat]",
                    :user="user",
                    :users="users",
                    :admin="admin",
                    @deleted="deleted"
                  )
            .col-lg-4
              jazz-calendar.mt-4
        b-tab(title="Benutzer")
          user-panels
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import User from "../../../lib/users/user";
import { allUsers, currentUser, icals, veranstaltungenForTeam } from "@/commons/loader";
import Accessrights from "../../../lib/commons/accessrights";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import UserPanel from "@/views/user/UserPanel.vue";
import JazzCalendar from "@/views/calendar/JazzCalendar.vue";
import { CalSource } from "../../../lib/optionen/ferienIcals";
import groupBy = require("lodash/groupBy");
import PanelsForMonat from "@/views/team/PanelsForMonat.vue";
import UserPanels from "@/views/user/UserPanels.vue";

@Component({
  components: { UserPanels, JazzCalendar, UserPanel, PanelsForMonat },
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

  private loading = false;

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
    this.loading = true;
    this.veranstaltungen = [];
    veranstaltungenForTeam(this.zukuenftige ? "zukuenftige" : "vergangene", (veranstaltungen: Veranstaltung[]) => {
      this.veranstaltungen = veranstaltungen;
      this.loading = false;
    });
  }

  get webcalUrl(): string {
    return `${window.location.origin.replace(/https|http/, "webcal")}/ical/`;
  }

  get veranstaltungenNachMonat(): { [index: string]: Veranstaltung[] } {
    const filteredVeranstaltungen = this.veranstaltungen.filter((v) => this.admin || v.kopf.confirmed);
    return groupBy(filteredVeranstaltungen, (veranst) => veranst.startDatumUhrzeit().monatLangJahrKompakt);
  }

  get monate(): string[] {
    return Object.keys(this.veranstaltungenNachMonat);
  }

  otherUsers(): User[] {
    return this.users?.filter((u) => u.id !== this.user.id) || [];
  }

  deleted(veranstaltung: Veranstaltung): void {
    const idx = this.veranstaltungen.indexOf(veranstaltung);
    if (idx > -1) {
      this.veranstaltungen.splice(idx, 1);
    }
  }
}
</script>
