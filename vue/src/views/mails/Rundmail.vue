<template lang="pug">
.col-12
  .row
    .col-12
      .btn-group.float-right
        b-button.btn.btn-success(@click="sendMail", title="Speichern", :disabled="!valid")
          b-icon-envelope
          .d-none.d.d-sm-inline #{ " " } Senden...
      h1 Rundmail
  .row
    .col-6
      jazz-label(label="Gruppen / Mailinglisten")
      multi-select(v-model="selectedListen", :options="listen")
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
import Message from "jc-shared/mail/message";
import User from "jc-shared/user/user";
import Users from "jc-shared/user/users";
import MultiSelect from "../../widgets/MultiSelect.vue";
import { allUsers, currentUser, sendMail } from "../../commons/loader";
import JazzLabel from "../../widgets/JazzLabel.vue";
import JazzText from "../../widgets/JazzText.vue";
import Markdown from "../../widgets/Markdown.vue";

@Component({ components: { MultiSelect, JazzText, JazzLabel, Markdown } })
export default class Rundmail extends Vue {
  private subject = "";
  private markdown = "";
  private user = new User({});
  private users: User[] = [];
  private selectedUsers: string[] = [];
  private selectedListen: string[] = [];

  private groupdNames = ["Alle", "Orga Team", "Booking Team"];

  mounted() {
    document.title = "Rundmail";
  }

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

  async sendMail() {
    const groups = this.groupdNames.filter((gr) => this.selectedListen.includes(gr)).map((gr) => lowerFirst(gr).replaceAll(" ", ""));
    const listen = difference(this.selectedListen, this.groupdNames);
    const validUsers = new Users(this.users).filterReceivers(groups, this.selectedUsers, listen).filter((user) => !!user.email);
    const emails = validUsers.map((user) => Message.formatEMailAddress(user.name, user.email));

    const result = new Message({ subject: this.subject, markdown: this.markdown }, this.user.name, this.user.email);
    result.setBcc(emails);
    await sendMail(result);
    this.subject = "";
    this.markdown = "";
    this.selectedListen = [];
    this.selectedUsers = [];
  }

  async created() {
    this.users = (await allUsers()) || [];
    this.user = await currentUser();
  }
}
</script>
