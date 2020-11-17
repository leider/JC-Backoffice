<template lang="pug">
b-button.btn.btn-danger(:disabled="dirty", v-b-modal="`delete-${id}`")
  b-icon-trash
  span(v-if="showText") #{" "}Löschen
  delete-dialog(:id="id", :callback="callback", :objecttype="objecttype", :name="name")
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import DeleteDialog from "./DeleteDialog.vue";

@Component({ components: { DeleteDialog } })
export default class DeleteButtonWithDialog extends Vue {
  @Prop() id!: string;
  @Prop() name!: string;
  @Prop() objecttype!: string;
  @Prop() callback!: Function;
  @Prop() dirty!: boolean;
  @Prop() showText!: boolean;
}
</script>

<style scoped></style>
