<template lang="pug">
.col-12.col-lg-6
  p Bitte melde Dich an.
  .row
    .col-12
      jazz-text(v-model="username", label="Benutzername", required)
  .row
    .col-12
      jazz-pass(v-model="password", label="Passwort", required)
  .row
    .col-12
      b-button.float-right.btn.btn-success(@click="login", title="Anmelden") Anmelden
</template>

<script lang="ts">
import JazzPass from "../../widgets/JazzPass.vue";
import JazzText from "../../widgets/JazzText.vue";
import { login } from "@/commons/loader";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({ components: { JazzText, JazzPass } })
export default class Login extends Vue {
  @Prop() originalURL!: string;
  private username = "";
  private password = "";

  async login() {
    await login(this.username, this.password);
    this.$router.push((this.$route.query.originalURL as string) || "/");
  }
}
</script>

<style scoped></style>
