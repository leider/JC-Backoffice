<template lang="pug">
.row
  .col-6.pl-2.pr-1
    .form-group
      jazz-label(:label="label", :tooltip="tooltip")
      b-form-datepicker(
        v-if="!$isMobile()",
        v-model="datestring",
        :min="min",
        :state="valid",
        locale="de",
        start-weekday="1",
        :date-format-options="{ year: '2-digit', month: '2-digit', day: '2-digit', weekday: 'short' }"
      )
      b-form-input(v-else, type="date", v-model="datestring", :min="minstring", :state="valid")
      b-form-invalid-feedback {{ invalidFeedback }}
  .col-6.pl-1.pr-2
    .form-group
      label &nbsp;
      b-form-input.text-right(type="time", v-model="timestring", :state="valid")
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import DatumUhrzeit from "../../lib/commons/DatumUhrzeit";
import JazzLabel from "@/widgets/JazzLabel.vue";

@Component({
  components: { JazzLabel },
})
export default class JazzDateTime extends Vue {
  @Prop() value!: Date;
  @Prop() min!: Date;
  @Prop() readonly label!: string;
  @Prop() readonly tooltip!: string | undefined;
  private validTimestring = true;
  private intTimestring = "";

  get datestring(): string {
    return DatumUhrzeit.forJSDate(this.value).fuerCalendarWidget;
  }
  set datestring(str: string) {
    this.emitChange(str, this.timestring);
  }

  get timestring(): string {
    if (this.validTimestring) {
      return DatumUhrzeit.forJSDate(this.value).format("HH:mm");
    }
    return this.intTimestring;
  }
  set timestring(str: string) {
    this.validTimestring = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(str);
    if (!this.validTimestring) {
      this.intTimestring = str;
      return;
    }
    this.emitChange(this.datestring, str);
  }

  get minstring(): string {
    return DatumUhrzeit.forJSDate(this.min).fuerCalendarWidget;
  }

  emitChange(date: string, time: string): void {
    const newDate = DatumUhrzeit.forISOString(`${date}T${time}`).toJSDate;
    this.$emit("old-and-new", { old: this.value, changed: newDate });
    this.$emit("input", newDate);
  }

  get valid(): boolean | null {
    if (!this.validTimestring) {
      return false;
    }
    if (this.min) {
      const a = DatumUhrzeit.forJSDate(this.value);
      const b = DatumUhrzeit.forJSDate(this.min);
      return b.istVorOderAn(a) ? null : false;
    }
    return null;
  }

  get invalidFeedback(): string {
    if (this.validTimestring) {
      return "Muss in der Zukunft liegen";
    }
    return "ungültige Uhrzeit";
  }
}
</script>
