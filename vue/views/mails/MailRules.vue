<template lang="pug">
.col-12
  .row
    .col-12
      .btn-group.float-right
        b-button.btn.btn-light(@click="neueRule", title="Neu")
          b-icon-file-earmark
          | #{" "} Neu...
      h1 Mailing Regeln
  .row
    .col-12
      .table-responsive(style="min-height:500px")
        table.table.table-sm.table-striped
          tbody
            tr
              th(style="width:30%") Name
              th(style="width:30%") E-Mail
              th(style="width:40%") Regel
              th
              th
            mail-rule-row(v-for="(rule, index) in rules", :key="index", :rule="rule", @loeschen="deleteRule(rule)")
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import MailRule from "../../../shared/mail/mailRule";
import MailRuleRow from "./MailRuleRow.vue";
import { deleteMailRule, mailRules } from "../../commons/loader";

@Component({ components: { MailRuleRow } })
export default class MailRules extends Vue {
  private rules: MailRule[] = [];

  mounted(): void {
    document.title = "Mailingregeln";
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
    deleteMailRule(rule.id, (err?: Error) => {
      if (!err) {
        const index = this.rules.indexOf(rule);
        this.rules.splice(index, 1);
      }
    });
  }
}
</script>
