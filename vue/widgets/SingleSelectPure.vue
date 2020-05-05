<template lang="pug">
  multiselect(:options="options", v-model="selected", :state="valid", :allowEmpty="false",
    :searchable="false", placeholder="Auswählen", selectLabel="", deselectLabel="", selectedLabel="",
    showLabels=false, :openDirection="openDirection")
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Multiselect from "vue-multiselect";

@Component({ components: { Multiselect } })
export default class SingleSelectPure extends Vue {
  @Prop() value!: string;
  @Prop() options!: string[];
  @Prop() readonly required!: boolean;
  @Prop() openDirection!: string;
  valid: boolean | null = null;

  get selected(): string {
    return this.value;
  }
  set selected(val: string) {
    this.$emit("input", val);
  }

  mounted(): void {
    this.validate();
  }

  updated(): void {
    this.validate();
  }

  @Watch("selected")
  validate(): void {
    if (this.required !== undefined) {
      if (this.selected === "") {
        this.valid = false;
      } else {
        this.valid = null;
      }
    }
  }
}
</script>
