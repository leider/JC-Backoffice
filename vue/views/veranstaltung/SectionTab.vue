<template lang="pug">
b-tab(:title-link-class="titlelinkclass", @click="clicked" )
  template(v-slot:title)
    i.fas.fa-fw(:class="icon")
    b.d-none.d-md-inline #{' '} {{title}}
  slot
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class SectionTab extends Vue {
  @Prop() section!: string;
  @Prop() title!: string;
  @Prop() icon!: string;

  @Prop() value!: string; // activeSection

  get titlelinkclass(): string {
    return `${this.value === this.section ? "color" : "tab"}-${this.section}`;
  }

  clicked(): void {
    this.$emit("clicked", this.section);
  }
}
</script>
