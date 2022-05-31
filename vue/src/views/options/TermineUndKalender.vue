<template lang="pug">
.col-12
  .row
    .col-12
      .btn-group.float-right
        b-button.btn.btn-light(@click="neuerTerminOderKalender", title="Neu")
          b-icon-file-earmark
          | #{ " " } Neu...
      h1 Termine und Kalender
      b-tabs(active-nav-item-class="color-allgemeines")
        b-tab(title="Termine", :active="'termine' === tab", @click="tabActivated('termine')")
          .row
            .col-12
              .table-responsive(style="min-height: 500px")
                table.table.table-sm.table-striped
                  tbody
                    tr
                      th Startet am
                      th Endet am
                      th(style="min-width: 200px") Beschreibung
                      th Typ
                      th(style="width: 50px")
                      th(style="width: 50px")
                    termin-row(v-for="(termin, index) in termine", :key="index", :termin="termin", @loeschen="deleteTermin(termin)")
        b-tab(title="Kalender", :active="'kalender' === tab", @click="tabActivated('kalender')")
          .row
            .col-12
              .table-responsive(style="min-height: 500px")
                table.table.table-sm.table-striped
                  tbody
                    tr
                      th(style="width: 150px; min-width: 150px") Name
                      th(style="min-width: 250px") URL
                      th(style="width: 150px") Typ
                      th(style="width: 50px")
                      th(style="width: 50px")
                    kalender-row(
                      v-for="(kalender, index) in kalender.icals",
                      :key="index",
                      :kalender="kalender",
                      @loeschen="deleteKalender(kalender)",
                      @speichern="saveKalender()"
                    )
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Termin from "jc-shared/optionen/termin";
import { deleteTermin, kalender, saveKalender, termine } from "../../commons/loader";
import FerienIcals, { Ical } from "jc-shared/optionen/ferienIcals";
import KalenderRow from "./KalenderRow.vue";
import TerminRow from "./TerminRow.vue";
@Component({
  components: { KalenderRow, TerminRow },
})
export default class TermineUndKalender extends Vue {
  private termine: Termin[] = [];
  private kalender: FerienIcals = new FerienIcals();
  @Prop() tab!: string;

  @Watch("$url")
  async mounted() {
    document.title = "Termine und Kalender";
    this.termine = (await termine()) || [];
    this.kalender = (await kalender()) || new FerienIcals();
  }

  tabActivated(section: string): void {
    if (this.tab !== section) {
      this.$router.replace(`/terminekalender/${section}`);
    }
  }

  async deleteTermin(termin: Termin) {
    if (!termin.id) {
      const index = this.termine.indexOf(termin);
      this.termine.splice(index, 1);
      return;
    }
    await deleteTermin(termin.id);
    const index = this.termine.indexOf(termin);
    this.termine.splice(index, 1);
  }

  neuerTerminOderKalender() {
    if (this.tab === "termine") {
      this.termine.unshift(new Termin());
    }
    if (this.tab === "kalender") {
      this.kalender.icals.unshift(new Ical());
    }
  }

  async saveKalender() {
    await saveKalender(this.kalender);
  }

  deleteKalender(kalender: Ical) {
    const index = this.kalender.icals.indexOf(kalender);
    this.kalender.icals.splice(index, 1);
    this.saveKalender();
  }
}
</script>
