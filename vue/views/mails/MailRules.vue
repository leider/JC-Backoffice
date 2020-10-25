<template lang="pug">
.col-12
  .row
    .col-12
      .btn-group.float-right
        button.btn.btn-light(@click="neueRule", title="Neu")
          b-icon-file-earmark
          | #{" "} Neu...
      h1 Mailing Regeln
  .row
    .col-12
      .table-responsive(style="min-height:500px")
        table.table.table-sm.table-striped
          tbody
            tr
              th Name
              th E-Mail
              th Regel
              th
              th
            mail-rule-row(v-for="(rule, index) in rules", :key="index", :rule="rule", @loeschen="deleteRule(rule)")
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import HeftCalendar from "@/views/calendar/HeftCalendar.vue";
import Markdown from "@/widgets/Markdown.vue";
import JazzLabel from "@/widgets/JazzLabel.vue";
import JazzText from "@/widgets/JazzText.vue";
import MultiSelect from "@/widgets/MultiSelect.vue";
import { deleteMailRule, mailRules } from "@/commons/loader";
import MailinglistRow from "@/views/mails/MailinglistRow.vue";
import MailRule from "../../../lib/mailsender/mailRule";
import MailRuleRow from "@/views/mails/MailRuleRow.vue";

@Component({ components: { MailRuleRow, MailinglistRow, MultiSelect, JazzText, JazzLabel, HeftCalendar, Markdown } })
export default class MailRules extends Vue {
  private rules: MailRule[] = [];

  created(): void {
    mailRules((rules: MailRule[]) => {
      this.rules = rules;
    });
  }

  neueRule(): void {
    if (this.rules.find((rule) => rule.name === "")) {
      return;
    }
    this.rules.push(new MailRule());
  }

  deleteRule(rule: MailRule) {
    deleteMailRule(rule.id, (message: string) => {
      console.log(message);
      const index = this.rules.indexOf(rule);
      this.rules.splice(index, 1);
    });
  }
}
</script>
