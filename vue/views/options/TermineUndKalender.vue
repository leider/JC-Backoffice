<template lang="pug">
.col-12
  .row
    .col-12
      .btn-group.float-right
        b-button.btn.btn-light(@click="neuerTerminOderKalender", title="Neu")
          b-icon-file-earmark
          | #{" "} Neu...
      h1 Termine und Kalender
      b-tabs(active-nav-item-class="font-weight-bold text-uppercase")
        b-tab(title="Termine", :active="'termine' === tab", @click="tabActivated('termine')")
          .row
            .col-12
              .table-responsive(style="min-height:500px")
                table.table.table-sm.table-striped
                  tbody
                    tr
                      th(style="width:15%") Startet am
                      th(style="width:15%") Endet am
                      th(style="width:85%") Beschreibung
                      th(style="width:85%") Typ
                      th
                      th
                    termin-row(v-for="(termin, index) in termine", :key="index", :termin="termin", @loeschen="deleteTermin(termin)")
        b-tab(title="Kalender", :active="'kalender' === tab", @click="tabActivated('kalender')")
          .row
            .col-12
              .table-responsive(style="min-height:500px")
                table.table.table-sm.table-striped
                  tbody
                    tr
                      th(style="width:15%") Name
                      th(style="width:70%") URL
                      th(style="width:15%") Typ
                      th
                      th
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
import TerminRow from "@/views/options/TerminRow.vue";
import Termin from "../../../lib/ical/termin";
import { deleteTermin, kalender, saveKalender, termine } from "@/commons/loader";
import KalenderRow from "@/views/options/KalenderRow.vue";
import FerienIcals, { Ical } from "../../../lib/optionen/ferienIcals";
@Component({
  components: { KalenderRow, TerminRow },
})
export default class TermineUndKalender extends Vue {
  private termine: Termin[] = [];
  private kalender: FerienIcals = new FerienIcals();
  @Prop() tab!: string;

  @Watch("$url")
  mounted(): void {
    document.title = "Termine und Kalender";
    termine((termine: Termin[]) => {
      this.termine = termine;
    });
    kalender((kalender: FerienIcals) => {
      this.kalender = kalender;
    });
  }

  tabActivated(section: string): void {
    this.$router.replace(`/terminekalender/${section}`);
  }

  deleteTermin(termin: Termin) {
    if (!termin.id) {
      const index = this.termine.indexOf(termin);
      this.termine.splice(index, 1);
      return;
    }
    deleteTermin(termin.id, (message: string) => {
      console.log(message);
      const index = this.termine.indexOf(termin);
      this.termine.splice(index, 1);
    });
  }

  neuerTerminOderKalender() {
    if (this.tab === "termine") {
      this.termine.unshift(new Termin());
    }
    if (this.tab === "kalender") {
      this.kalender.icals.unshift(new Ical());
    }
  }

  saveKalender() {
    saveKalender(this.kalender, (result: any) => {
      console.log(result);
    });
  }

  deleteKalender(kalender: Ical) {
    const index = this.kalender.icals.indexOf(kalender);
    this.kalender.icals.splice(index, 1);
    this.saveKalender();
  }
}
</script>
