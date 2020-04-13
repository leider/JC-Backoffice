<template lang="pug">
  multiselect(:options="options", v-model="selected", :closeOnSelect="false",
    searchable=true, placeholder="Auswählen", selectLabel="", deselectLabel="", selectedLabel="",
    showLabels=false, :openDirection="openDirection", multiple=true, :taggable="allowNewTags",
    tag-placeholder="Als neues Schlagwort hinzufügen", @tag="addTag")
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Multiselect from "vue-multiselect";

@Component({ components: { Multiselect } })
export default class MultiSelect extends Vue {
  @Prop() value!: string[];
  @Prop() options!: string[];
  @Prop() openDirection!: string;
  @Prop() allowNewTags!: boolean;

  get selected(): string[] | undefined {
    return this.value.filter((v) => (this.options || []).includes(v));
  }
  set selected(val: string[] | undefined) {
    this.$emit(
      "input",
      (val || []).filter((v) => (this.options || []).includes(v))
    );
  }

  addTag(tag: string): void {
    if (!this.allowNewTags || !this.options) {
      return;
    }
    this.options.push(tag);
    this.value.push(tag);
    this.$emit(
      "input",
      (this.value || []).filter((v) => this.options.includes(v))
    );
  }
}
</script>
