<template lang="pug">
div
  h1 Hallo
  p {{ JSON.stringify(users) }}
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { allUsers, globals } from "@/commons/loader";
import User from "jc-shared/user/user";

@Component({})
export default class Dings extends Vue {
  private users!: User[] = [];
  async created() {
    const isAuth = await globals.isAuthenticated();
    console.log({ isAuth });
    this.users = await allUsers();
  }
}
</script>

<style scoped></style>
