<template lang="pug">
tr
  th: .mt-1 {{label}}
  td: .mt-1: span.text-capitalize {{(section || []).join(', ')}}
  td.text-right
    b-button.btn.btn-success.btn-sm(v-if="!hasRegistered()", @click="add", title='Ich kann'): i.fa-fw.fa-lg.fas.fa-plus-circle
    b-button.btn.btn-danger.btn-sm(v-else, @click="remove", title='Ich kann nicht'): i.fa-fw.fa-lg.fas.fa-minus-circle
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import User from "../../../lib/users/user";

@Component
export default class StaffRow extends Vue {
  @Prop() section!: string[];
  @Prop() label!: string;
  @Prop() user!: User;

  hasRegistered() {
    return this.section.map(name => name.toLowerCase()).includes(this.user.id.toLowerCase());
  }

  add() {
    this.section.push(this.user.id);
    this.saveVeranstaltung();
  }

  remove() {
    const index = this.section.indexOf(this.user.id);
    this.section.splice(index, 1);
    this.saveVeranstaltung();
  }

  private saveVeranstaltung() {
    this.$emit("saveVeranstaltung");
  }
}
</script>

<style scoped></style>
