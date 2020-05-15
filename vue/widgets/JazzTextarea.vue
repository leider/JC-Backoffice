<template lang="pug">
.form-group
  jazz-label(:label="label", :tooltip="tooltip")
  b-form-textarea(:value="value", @input="$emit('input', $event)", :state="state", rows="7")
  b-form-invalid-feedback Muss ausgefüllt werden
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import JazzLabel from "@/widgets/JazzLabel.vue";
@Component({
  components: { JazzLabel },
})
export default class JazzTextarea extends Vue {
  @Prop() label!: string;
  @Prop() value!: string;
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
