<template lang="pug">
tr
  td: b-form-input(v-model="rule.name")
  td: b-form-input(v-model="rule.email")
  td: single-select-pure(v-model="rule.rule", :options="allRulenames")
  td: b-button.btn.btn-danger.float-right(:disabled="dirty", v-b-modal="`dialog-${rule.name}`")
    b-icon-trash
    b-modal(:id="`dialog-${rule.name}`", no-close-on-backdrop, @ok="loeschen")
      p Bist Du sicher, dass Du {{ rule.name }} löschen willst?
      template(v-slot:modal-header)
        h3.modal-title Liste löschen
      template(v-slot:modal-footer="{ ok, cancel }")
        .row: .col-12: .btn-group.float-right
          b-button.btn.btn-light(@click="cancel()") Abbrechen
          b-button.btn.btn-danger.text(@click="ok()")
            b-icon-trash
            | &nbsp;Löschen

  td: b-button.btn.btn-success.float-right(@click="save", :disabled="!dirty"): b-icon-check-square
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import MailRule, { allMailrules } from "../../../lib/mailsender/mailRule";
import SingleSelectPure from "@/widgets/SingleSelectPure.vue";
import { saveMailRule } from "@/commons/loader";

@Component({ components: { SingleSelectPure } })
export default class MailRuleRow extends Vue {
  private originalRule!: MailRule;
  @Prop() rule!: MailRule;

  private allRulenames = allMailrules;
  private dirty = false;

  created(): void {
    this.ruleChanged();
  }

  loeschen(): void {
    this.$emit("loeschen");
  }

  save(): void {
    saveMailRule(this.rule, () => {
      this.rule.updateId();
      this.ruleChanged();
      this.somethingChanged();
    });
  }

  @Watch("rule")
  ruleChanged() {
    this.originalRule = new MailRule(this.rule.toJSON());
  }

  @Watch("rule", { deep: true })
  somethingChanged(): void {
    function normCrLf(json: object): string {
      return JSON.stringify(json).replace(/\\r\\n/g, "\\n");
    }

    this.dirty = normCrLf(this.originalRule) !== normCrLf(this.rule);
  }
}
</script>
