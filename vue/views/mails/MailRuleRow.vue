<template lang="pug">
tr
  td: b-form-input(v-model="rule.name")
  td: b-form-input(v-model="rule.email")
  td: single-select-pure(v-model="rule.rule", :options="allRulenames")
  td: delete-button-with-dialog(:id="rule.name", :name="rule.name", objecttype="Regel", :callback="loeschen", :dirty="dirty")
  td: b-button.btn.btn-success.float-right(@click="save", :disabled="!dirty"): b-icon-check-square
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import MailRule, { allMailrules } from "../../../backend/lib/mailsender/mailRule";
import SingleSelectPure from "@/widgets/SingleSelectPure.vue";
import { saveMailRule } from "@/commons/loader";
import DeleteButtonWithDialog from "@/widgets/DeleteButtonWithDialog.vue";

@Component({ components: { DeleteButtonWithDialog, SingleSelectPure } })
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
    saveMailRule(this.rule, (err?: Error) => {
      if (!err) {
        this.rule.updateId();
        this.ruleChanged();
        this.somethingChanged();
      }
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
