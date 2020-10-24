<template lang="pug">
.col-12
  .row.page-header
    .col-12
      .btn-group.float-right
        button.btn.btn-success(@click="sendMail", title="Speichern", :disabled="!valid")
          b-icon-envelope-open
          | #{" "} Senden...
      h1 Rundmail
  .row
    .col-6
      jazz-label(label="Gruppen / Mailinglisten")
      multi-select(label="Gruppen / Mailinglisten", v-model="selectedListen", :options="listen")
    .col-6
      jazz-label(label="Users")
      multi-select(v-model="selectedUsers", :options="userids")
  .row
    .col-12
      jazz-text(label="Subject", placeholder="Bitte ausfüllen", v-model="subject")
      jazz-label(label="Anschreiben")
      markdown#kalender(
        v-model="markdown",
        theme="light",
        height="600",
        toolbar="bold italic heading | image link | numlist bullist | preview fullscreen help"
      )
</template>

<script lang="ts">
import difference from "lodash/difference";
import lowerFirst from "lodash/lowerFirst";
import { Component, Vue } from "vue-property-decorator";
import HeftCalendar from "@/views/calendar/HeftCalendar.vue";
import Markdown from "@/widgets/Markdown.vue";
import JazzLabel from "@/widgets/JazzLabel.vue";
import JazzText from "@/widgets/JazzText.vue";
import Message from "../../../lib/mailsender/message";
import { allUsers, currentUser, sendMail } from "@/commons/loader";
import User from "../../../lib/users/user";
import Accessrights from "../../../lib/commons/accessrights";
import MultiSelect from "@/widgets/MultiSelect.vue";
import Users from "../../../lib/users/users";

@Component({ components: { MultiSelect, JazzText, JazzLabel, HeftCalendar, Markdown } })
export default class Rundmail extends Vue {
  private subject = "";
  private markdown = "";
  private user = new User({});
  private users: User[] = [];
  private selectedUsers: string[] = [];
  private selectedListen: string[] = [];

  private groupdNames = ["Alle", "Orga Team", "Booking Team"];

  get listen(): string[] {
    const listNames = new Users(this.users).mailinglisten.map((l) => l.name);
    return this.groupdNames.concat(listNames);
  }

  get userids(): string[] {
    return this.users.map((u) => u.id);
  }

  get valid(): boolean {
    return !!this.subject && !!this.markdown && (this.selectedListen.length > 0 || this.selectedUsers.length > 0);
  }

  sendMail(): void {
    const groups = this.groupdNames.filter((gr) => this.selectedListen.includes(gr)).map((gr) => lowerFirst(gr).replaceAll(" ", ""));
    const listen = difference(this.selectedListen, this.groupdNames);
    const validUsers = new Users(this.users).filterReceivers(groups, this.selectedUsers, listen).filter((user) => !!user.email);
    const emails = validUsers.map((user) => Message.formatEMailAddress(user.name, user.email));

    const result = new Message({ subject: this.subject, markdown: this.markdown }, this.user.name, this.user.email);
    result.setBcc(emails);
    sendMail(result, (message: any) => {
      this.subject = "";
      this.markdown = "";
      this.selectedListen = [];
      this.selectedUsers = [];
      console.log(message);
    });
  }

  created(): void {
    allUsers((users: User[]) => {
      this.users = users;
    });
    currentUser((user: User) => {
      user.accessrights = new Accessrights(user);
      this.user = user;
    });
  }
}
</script>
