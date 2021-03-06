<template lang="pug">
.col-12
  .row
    .col-12
      .btn-group.float-right
        b-button.btn.btn-success(@click="sendMail", title="Speichern", :disabled="!valid")
          b-icon-envelope
          .d-none.d.d-sm-inline #{ " " } Senden...
      h1 Manuelle Nachricht
  .row
    .col-6
      jazz-label(label="Veranstaltungen")
      multi-select(v-model="selectedVeranstaltungen", :options="descriptions")
    .col-6
      jazz-label(label="Empfänger (aus Regeln)")
      multi-select(v-model="selectedRules", :options="rules")
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
import { Component, Vue } from "vue-property-decorator";
import Message from "jc-shared/mail/message";
import { currentUser, mailRules, sendMail, veranstaltungenForTeam } from "../../commons/loader";
import User from "jc-shared/user/user";
import MailRule from "jc-shared/mail/mailRule";
import MultiSelect from "../../widgets/MultiSelect.vue";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import JazzText from "../../widgets/JazzText.vue";
import JazzLabel from "../../widgets/JazzLabel.vue";
import Markdown from "../../widgets/Markdown.vue";
import VeranstaltungFormatter from "jc-shared/veranstaltung/veranstaltungFormatter";

@Component({ components: { MultiSelect, JazzText, JazzLabel, Markdown } })
export default class ManualMail extends Vue {
  private subject = "[Jazzclub manuell] Veranstaltungen für ...";
  private markdown = "";
  private user = new User({});
  private allRules: MailRule[] = [];
  private selectedRules: string[] = [];
  private selectedVeranstaltungen: string[] = [];
  private veranstaltungen: Veranstaltung[] = [];

  mounted() {
    document.title = "Manuelle Nachricht";
  }

  get rules(): string[] {
    return this.allRules.map((rule) => rule.name);
  }

  get descriptions(): string[] {
    return this.veranstaltungen.map((v) => new VeranstaltungFormatter(v).description);
  }

  get valid(): boolean {
    return !!this.subject && !!this.markdown && this.selectedRules.length > 0;
  }

  sendMail(): void {
    const upcomings = this.veranstaltungen.filter((v) => this.selectedVeranstaltungen.includes(new VeranstaltungFormatter(v).description));
    const rules = this.allRules.filter((r) => this.selectedRules.includes(r.name));

    const emails = rules.map((user) => Message.formatEMailAddress(user.name, user.email));

    const markdownToSend =
      this.markdown +
      "\n\n---\n" +
      upcomings.map((veranst) => new VeranstaltungFormatter(veranst).presseTextForMail(window.location.origin)).join("\n\n---\n");
    const result = new Message({ subject: this.subject, markdown: markdownToSend }, this.user.name, this.user.email);
    result.setBcc(emails);
    sendMail(result, (err?: Error) => {
      if (!err) {
        this.subject = "[Jazzclub manuell] Veranstaltungen für ...";
        this.markdown = "";
        this.selectedRules = [];
        this.selectedVeranstaltungen = [];
      }
    });
  }

  created(): void {
    mailRules((rules: MailRule[]) => {
      this.allRules = rules;
    });
    currentUser((user: User) => {
      this.user = user;
    });
    veranstaltungenForTeam("zukuenftige", (veranstaltungen: Veranstaltung[]) => {
      this.veranstaltungen = veranstaltungen;
    });
  }
}
</script>
