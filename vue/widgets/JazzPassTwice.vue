<template lang="pug">
div
  .form-group
    jazz-label(label="Passwort")
    b-form-input(v-model="p1", type="password", :state="state", autocomplete="off")
  .form-group
    jazz-label(label="Passwort wiederholen")
    b-form-input(v-model="p2", type="password", :state="state", autocomplete="off")
    b-form-invalid-feedback Muss ausgefüllt werden und identisch sein
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import JazzLabel from "@/widgets/JazzLabel.vue";

@Component({
  components: { JazzLabel },
})
export default class JazzPassTwice extends Vue {
  @Prop() value!: string;
  private pass1 = this.value;
  private pass2 = this.value;

  get p1(): string {
    return this.pass1;
  }
  set p1(text: string) {
    this.pass1 = text;
    this.emitChange();
  }

  get p2(): string {
    return this.pass2;
  }
  set p2(text: string) {
    this.pass2 = text;
    this.emitChange();
  }

  get state(): boolean | null {
    return this.pass1 === this.pass2 && this.pass1.length > 5 && this.pass2.length > 5 ? null : false;
  }

  emitChange(): void {
    if (this.state === null) {
      this.$emit("input", this.pass1);
    } else {
      this.$emit("input", "");
    }
  }
}
</script>
