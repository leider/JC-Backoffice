<template lang="pug">
.form-group
  jazz-label(:label="label", :tooltip="tooltip")
  b-form-input(:value="value", @input="$emit('input', $event)", :state="state", :placeholder="placeholder")
  b-form-invalid-feedback Muss ausgefüllt werden
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import JazzLabel from "@/widgets/JazzLabel.vue";
@Component({
  components: { JazzLabel },
})
export default class JazzText extends Vue {
  @Prop() label!: string;
  @Prop() value!: string;
  @Prop() tooltip!: string | undefined;
  @Prop() required!: boolean;
  @Prop() placeholder!: string;

  get state(): boolean | null {
    if (!this.required) {
      return null;
    }
    return !!this.value && this.value.length > 0 ? null : false;
  }
}
</script>
