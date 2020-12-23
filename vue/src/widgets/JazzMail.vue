<template lang="pug">
.form-group
  jazz-label(:label="label", :tooltip="tooltip")
  b-form-input(:value="value", @input="$emit('input', $event)", type="email", :state="state")
  b-form-invalid-feedback E-Mail Adresse ungültig
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import JazzLabel from "./JazzLabel.vue";

@Component({ components: { JazzLabel } })
export default class JazzMail extends Vue {
  @Prop() label!: string;
  @Prop() value!: string;
  @Prop() tooltip!: string | undefined;
  @Prop() required!: boolean;

  get state(): boolean | null {
    const validEmail = !(this.value && !this.value.match(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/));

    if (!this.required) {
      return validEmail ? null : false;
    }
    return !!this.value && this.value.length > 0 && validEmail ? null : false;
  }
}
</script>
