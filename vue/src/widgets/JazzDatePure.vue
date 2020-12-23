<template lang="pug">
b-form-datepicker(
  v-if="!$isMobile()",
  v-model="datestring",
  locale="de",
  start-weekday="1",
  :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }"
)
b-form-input(v-else, type="date", v-model="datestring")
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";

@Component
export default class JazzDatePure extends Vue {
  @Prop() value!: Date;

  get datestring(): string {
    return DatumUhrzeit.forJSDate(this.value).fuerCalendarWidget;
  }
  set datestring(str: string) {
    this.emitChange(str);
  }

  emitChange(date: string): void {
    const newDate = DatumUhrzeit.forISOString(`${date}T00:00`).toJSDate;
    this.$emit("input", newDate);
  }
}
</script>
