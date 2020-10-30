<template lang="pug">
b-modal(:id="`delete-${id}`", no-close-on-backdrop, @ok="callback")
  p Bist Du sicher, dass Du "{{ name }}" löschen willst?
  template(v-slot:modal-header)
    h3.modal-title {{ objecttype }} löschen
  template(v-slot:modal-footer="{ ok, cancel }")
    .row: .col-12: .btn-group.float-right
      b-button.btn.btn-light(@click="cancel()") Abbrechen
      b-button.btn.btn-danger.text(@click="ok()")
        b-icon-trash
        | &nbsp;Löschen
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class DeleteDialog extends Vue {
  @Prop() id!: string;
  @Prop() name!: string;
  @Prop() objecttype!: string;
  @Prop() callback!: Function;
}
</script>

<style scoped></style>
