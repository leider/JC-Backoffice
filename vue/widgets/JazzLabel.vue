<template lang="pug">
label(v-if="tooltip"): span(v-b-tooltip="tooltip") {{ label }}:&nbsp;
  i.fas.fa-question-circle
label(v-else) {{ label }}:
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class JazzLabel extends Vue {
  @Prop() label!: string;
  @Prop() tooltip!: string | undefined;
}
</script>
