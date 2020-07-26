<template lang="pug">
.form-group
  jazz-label(:label="label", :tooltip="tooltip")
  b-form-datepicker(v-if="!$isMobile()", v-model="datestring", :min="min", :state="valid", locale="de",
    start-weekday="1", :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }")
  b-form-input(v-else, type="date", v-model="datestring", :min="minstring", :state="valid")
  b-form-invalid-feedback {{invalidFeedback}}

</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import DatumUhrzeit from "../../lib/commons/DatumUhrzeit";
import JazzLabel from "@/widgets/JazzLabel.vue";

@Component({
  components: { JazzLabel },
})
export default class JazzDate extends Vue {
  @Prop() value!: Date;
  @Prop() min!: Date;
  @Prop() readonly label!: string;
  @Prop() readonly tooltip!: string | undefined;

  get datestring(): string {
    return DatumUhrzeit.forJSDate(this.value).fuerCalendarWidget;
  }
  set datestring(str: string) {
    this.emitChange(str);
  }

  get minstring(): string {
    return DatumUhrzeit.forJSDate(this.min).fuerCalendarWidget;
  }

  emitChange(date: string): void {
    const newDate = DatumUhrzeit.forISOString(`${date}T00:00`).toJSDate;
    this.$emit("oldAndNew", { old: this.value, changed: newDate });
    this.$emit("input", newDate);
  }

  get valid(): boolean | null {
    if (this.min) {
      const a = DatumUhrzeit.forJSDate(this.value);
      const b = DatumUhrzeit.forJSDate(this.min);
      const check = a.istNach(b) || a.mitUhrzeitNumerisch === b.mitUhrzeitNumerisch;
      return check ? null : false;
    }
    return null;
  }

  get invalidFeedback(): string {
    return "Muss in der Zukunft liegen";
  }
}
</script>
