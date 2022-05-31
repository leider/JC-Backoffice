<template lang="pug">
.col-12
  .row
    .col-12
      .btn-group.float-right
        b-button.btn.btn-light(@click="neueListe", title="Neu")
          b-icon-file-earmark
          .d-none.d.d-sm-inline #{ " " } Neu...
      h1 Mailinglisten
  .row
    .col-12
      .table-responsive(style="min-height: 500px")
        table.table.table-sm.table-striped
          tbody
            tr
              th(style="min-width: 150px") Name
              th Users
              th(style="width: 50px")
              th(style="width: 50px")
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
import User from "jc-shared/user/user";
import Users, { Mailingliste } from "jc-shared/user/users";
import { allUsers, deleteMailinglist } from "../../commons/loader";
import MailinglistRow from "./MailinglistRow.vue";

@Component({ components: { MailinglistRow } })
export default class Mailinglisten extends Vue {
  private mailinglisten: Mailingliste[] = [];
  private users: User[] = [];

  async mounted() {
    document.title = "Mailinglisten";
    this.users = (await allUsers()) || [];
    this.mailinglisten = new Users(this.users).mailinglisten;
  }

  neueListe(): void {
    if (this.mailinglisten.find((list) => list.name === "")) {
      return;
    }
    this.mailinglisten.push(new Mailingliste("", []));
  }

  async deleteList(list: Mailingliste) {
    await deleteMailinglist(list.name);
    const index = this.mailinglisten.indexOf(list);
    this.mailinglisten.splice(index, 1);
  }
}
</script>
