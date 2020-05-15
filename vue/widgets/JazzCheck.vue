<template lang="pug">
b-form-checkbox(:class="inline ? '' : 'pt-4'", :checked="value", @input="$emit('input', $event)") {{label}}
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class JazzCheck extends Vue {
  @Prop() value!: boolean;
  @Prop() label!: string;
  @Prop() inline!: boolean;
}
</script>
