<template lang="pug">
.col-12
  h1 Kassenberichte
  p(v-for="monat in monate", :key="monat.monatJahrKompakt")
    a(:href="`/pdf/kassenbericht/${monat.fuerKalenderViews}`") Kassenbericht {{ monat.monatJahrKompakt }}
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import DatumUhrzeit from "../../../shared/commons/DatumUhrzeit";

@Component
export default class Kassenbericht extends Vue {
  mounted() {
    document.title = "Kassenberichte";
  }

  get monate(): DatumUhrzeit[] {
    const result: DatumUhrzeit[] = [];
    let current = new DatumUhrzeit().minus({ monate: 6 });
    for (let i = 0; i < 12; i++) {
      result.push(current);
      current = current.plus({ monate: 1 });
    }
    return result;
  }
}
</script>
