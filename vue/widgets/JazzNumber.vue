<template lang="pug">
.form-group
  jazz-label(:label="label", :tooltip="tooltip")
  b-form-input(:value="value", @input="$emit('input', $event)", type="number", :min="min", :max="max", :state="state")
  b-form-invalid-feedback Muss ausgefüllt werden
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import JazzLabel from "@/widgets/JazzLabel.vue";
@Component({
  components: { JazzLabel },
})
export default class JazzNumber extends Vue {
  @Prop() label!: string;
  @Prop() value!: string;
  @Prop() min!: string;
  @Prop() max!: string;
  @Prop() tooltip!: string | undefined;
  @Prop() required!: boolean;

  get state(): boolean | null {
    if (!this.required) {
      return null;
    }
    return !!this.value && this.value.length > 0 ? null : false;
  }
}
</script>
