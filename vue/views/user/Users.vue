<template lang="pug">
.col-12
  .page-header
    h2 Registrierte User
  .row
    user-panel(:currentUser="user", :user="user")
    user-panel(v-for="u in otherUsers()", :key="u.id", :currentUser="user", :user="u")
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import User from "../../../lib/users/user";
import { allUsers, currentUser } from "@/commons/loader";
import Accessrights from "../../../lib/commons/accessrights";
import UserPanel from "@/views/user/UserPanel.vue";

@Component({
  components: { UserPanel },
})
export default class Users extends Vue {
  private user: User = new User({});
  private users: User[] = [];

  created(): void {
    allUsers((users: User[]) => {
      this.users = users;
    });
    currentUser((user: User) => {
      user.accessrights = new Accessrights(user);
      this.user = user;
    });
  }

  otherUsers(): User[] {
    return this.users?.filter((u) => u.id !== this.user.id) || [];
  }
}
</script>
