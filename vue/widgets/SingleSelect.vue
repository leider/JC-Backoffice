<template lang="pug">
.form-group
  jazz-label(v-if="label", :label="label", :tooltip="tooltip")
  single-select-pure(:value="value", :options="options", :required="required", :openDirection="openDirection",
    @input="$emit('input', $event)")
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import JazzLabel from "@/widgets/JazzLabel.vue";
import SingleSelectPure from "@/widgets/SingleSelectPure.vue";

@Component({ components: { SingleSelectPure, JazzLabel } })
export default class SingleSelect extends Vue {
  @Prop() value!: string;
  @Prop() label!: string;
  @Prop() tooltip!: string;
  @Prop() options!: string[];
  @Prop() readonly required!: boolean;
  @Prop() openDirection!: string;
}
</script>
