<template lang="pug">
.row
  .col-6
    jazz-date-time(label="Start", tooltip="Startzeitpunkt", v-model="veranstaltung.startDate", :min="minimumStart.toJSDate"
      @oldAndNew="startChanged")
  .col-6
    jazz-date-time(label="Ende", tooltip="Erwartetes Ende", v-model="veranstaltung.endDate", :min="veranstaltung.startDate")
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Veranstaltung from "../../lib/veranstaltungen/object/veranstaltung";
import JazzDateTime from "@/widgets/JazzDateTime.vue";
import DatumUhrzeit from "../../lib/commons/DatumUhrzeit";

@Component({
  components: { JazzDateTime },
})
export default class JazzInterval extends Vue {
  @Prop() veranstaltung!: Veranstaltung;
  @Prop() minimumStart!: DatumUhrzeit;

  startChanged({ old, changed }: { old: Date; changed: Date }): void {
    const diff = changed.getTime() - old.getTime();
    this.veranstaltung.endDate = new Date(this.veranstaltung.endDate.getTime() + diff);
  }
}
</script>
