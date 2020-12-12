<template lang="pug">
.col-12
  p Hallo
</template>

<script lang="ts">
import { currentUser } from "../../commons/loader";
import router from "../../router";
import { Vue } from "vue-property-decorator";
import User from "../../../shared/user/user";

export default class Home extends Vue {
  crated(): void {
    console.log("OOPS");
    currentUser((user: User) => {
      if (user.accessrights?.isOrgaTeam) {
        console.log("1");
        router.push("/veranstaltungen/zukuenftige");
        return;
      }
      console.log("2");
      router.push("/team");
    });
  }
}
</script>
