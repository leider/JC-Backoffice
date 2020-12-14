<template lang="pug">
.col-lg-12
  b-tabs(active-nav-item-class="color-allgemeines")
    b-tab(:title="realadmin ? 'Veranstaltungen' : 'Team'")
      .row
        .col-lg-8
          .row
            .col-12
              b-overlay(:show="loading")
                div(v-if="!realadmin")
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
                    b-dropdown(variant="light", right, :text="dropdownText")
                      b-dropdown-item(to="/veranstaltungen/zukuenftige") Zukünftige
                      b-dropdown-item(to="/veranstaltungen/vergangene") Vergangene
                      b-dropdown-item(to="/veranstaltungen/alle") Alle
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
                :admin="realadmin",
                @deleted="deleted"
              )
        .col-lg-4
          jazz-calendar.mt-4
    b-tab(title="Benutzer")
      user-panels(:user="user", :users="users", @reload-users="reloadUsers")
</template>

<script lang="ts">
import groupBy from "lodash/groupBy";
import upperFirst from "lodash/upperFirst";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import User from "../../../shared/user/user";
import Veranstaltung from "../../../shared/veranstaltung/veranstaltung";
import UserPanels from "../user/UserPanels.vue";
import { allUsers, currentUser, veranstaltungenForTeam } from "../../commons/loader";
import JazzCalendar from "../calendar/JazzCalendar.vue";
import PanelsForMonat from "./PanelsForMonat.vue";
import UserPanel from "../user/UserPanel.vue";

@Component({
  components: { UserPanels, JazzCalendar, UserPanel, PanelsForMonat },
})
export default class Team extends Vue {
  @Prop() admin!: boolean;
  @Prop() periode: "zukuenftige" | "vergangene" | "alle" = "zukuenftige";
  private user: User = new User({ id: "invalidUser" });
  private users: User[] = [];
  // noinspection JSMismatchedCollectionQueryUpdate
  private veranstaltungen: Veranstaltung[] = [];

  private loading = false;

  mounted(): void {
    this.reloadUsers();
    this.reloadVeranstaltungen();
  }

  reloadUsers() {
    allUsers((users: User[]) => {
      this.users = users;
    });
    currentUser((user: User) => {
      this.user = user;
      if (this.$route.path.startsWith("/veranstaltungen") && !this.realadmin) {
        if (this.user.id !== "invalidUser") {
          this.$router.replace({ path: "/team" });
        }
      }
    });
  }

  get dropdownText(): string {
    return upperFirst(this.periode).replace("ue", "ü");
  }

  get realadmin(): boolean {
    return this.admin && (this.user.accessrights?.isOrgaTeam || false);
  }

  @Watch("admin")
  @Watch("periode")
  reloadVeranstaltungen(): void {
    document.title = this.realadmin ? "Veranstaltungen" : "Team";
    this.loading = true;
    this.veranstaltungen = [];
    veranstaltungenForTeam(this.periode, (veranstaltungen: Veranstaltung[]) => {
      this.veranstaltungen = veranstaltungen;
      this.loading = false;
    });
  }

  get webcalUrl(): string {
    return `${window.location.origin.replace(/https|http/, "webcal")}/ical/`;
  }

  get veranstaltungenNachMonat(): { [index: string]: Veranstaltung[] } {
    const filteredVeranstaltungen = this.veranstaltungen.filter((v) => this.realadmin || v.kopf.confirmed);
    return groupBy(filteredVeranstaltungen, (veranst: Veranstaltung) => veranst.startDatumUhrzeit().monatLangJahrKompakt);
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
