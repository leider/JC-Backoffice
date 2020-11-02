<template lang="pug">
.col-12
  .row
    .col-12
      .btn-group.float-right
        b-button.btn.btn-light(@click="neueListe", title="Neu")
          b-icon-file-earmark
          | #{" "} Neu...
      h1 Mailinglisten
  .row
    .col-12
      .table-responsive(style="min-height:500px")
        table.table.table-sm.table-striped
          tbody
            tr
              th(style="width:15%") Name
              th(style="width:85%") Users
              th
              th
            mailinglist-row(
              v-for="(list, index) in mailinglisten",
              :key="index",
              :mailinglist="list",
              :users="users",
              @loeschen="deleteList(list)"
            )
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import User from "../../../lib/users/user";
import Users, { Mailingliste } from "../../../lib/users/users";
import { allUsers, deleteMailinglist } from "@/commons/loader";
import MailinglistRow from "@/views/mails/MailinglistRow.vue";

@Component({ components: { MailinglistRow } })
export default class Mailinglisten extends Vue {
  private mailinglisten: Mailingliste[] = [];
  private users: User[] = [];

  created(): void {
    allUsers((users: User[]) => {
      this.users = users;
      this.mailinglisten = new Users(users).mailinglisten;
    });
  }

  neueListe(): void {
    if (this.mailinglisten.find((list) => list.name === "")) {
      return;
    }
    this.mailinglisten.push(new Mailingliste("", []));
  }

  deleteList(list: Mailingliste) {
    deleteMailinglist(list.name, (err?: Error) => {
      if (!err) {
        const index = this.mailinglisten.indexOf(list);
        this.mailinglisten.splice(index, 1);
      }
    });
  }
}
</script>
