<template lang="pug">
div
  user-panels-toolbar(:currentUser="user", :users="users", @user-saved="reload")
  .row
    user-panel(:currentUser="user", :key="user.id", :user="actualUser()", @user-saved="reload", @reload-users="reload")
    user-panel(v-for="u in otherUsers()", :key="u.id", :currentUser="user", :user="u", @user-saved="reload", @reload-users="reload")
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import User from "../../../lib/users/user";
import { allUsers, currentUser } from "@/commons/loader";
import UserPanel from "@/views/user/UserPanel.vue";
import Accessrights from "../../../lib/commons/accessrights";
import UserPanelsToolbar from "@/views/user/UserPanelsToolbar.vue";

@Component({
  components: { UserPanelsToolbar, UserPanel },
})
export default class UserPanels extends Vue {
  private user = new User({});
  private users: User[] = [];

  created(): void {
    this.reload();
  }

  reload(): void {
    allUsers((users: User[]) => {
      this.users = users;
    });
    currentUser((user: User) => {
      user.accessrights = new Accessrights(user);
      this.user = user;
    });
  }

  actualUser(): User {
    return this.users?.find((u) => u.id === this.user.id) || new User({});
  }

  otherUsers(): User[] {
    return this.users?.filter((u) => u.id !== this.user.id) || [];
  }
}
</script>
