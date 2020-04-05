<template lang="pug">
  multiselect(:options="options", v-model="selected", :state="valid",
    placeholder="Tippen zum Suchen", selectLabel="", deselectLabel="", selectedLabel="Gewählt",
    allowEmpty=false, showLabels=false, :openDirection="openDirection", multiple=true, taggable=true,
    tag-placeholder="Als neues Schlagwort hinzufügen", @tag="addTag")
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Multiselect from "vue-multiselect";

@Component({ components: { Multiselect } })
export default class MultiSelect extends Vue {
  @Prop() value!: string[];
  @Prop() readonly label?: string;
  @Prop() options?: string[];
  @Prop() readonly required?: boolean;
  @Prop() openDirection?: string;
  @Prop() noNewTags?: boolean;
  valid: boolean | null = null;

  get selected(): string[] | undefined {
    return this.value.filter((v) => (this.options || []).includes(v));
  }
  set selected(val: string[] | undefined) {
    this.$emit(
      "input",
      (val || []).filter((v) => (this.options || []).includes(v))
    );
  }

  mounted(): void {
    this.validate();
  }

  updated(): void {
    this.validate();
  }

  addTag(tag: string): void {
    if (this.noNewTags || !this.options) {
      return;
    }
    this.options.push(tag);
    this.value.push(tag);
    this.$emit(
      "input",
      (this.value || []).filter((v) => (this.options || []).includes(v))
    );
  }

  @Watch("selected")
  validate(): void {
    if (this.required !== undefined) {
      if ((this.selected || []).length === 0) {
        this.valid = false;
      } else {
        this.valid = null;
      }
    }
  }
}
</script>
