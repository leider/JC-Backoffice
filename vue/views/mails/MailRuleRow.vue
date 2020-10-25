<template lang="pug">
tr
  td: b-form-input(v-model="rule.name")
  td: b-form-input(v-model="rule.email")
  td: single-select-pure(v-model="rule.rule", :options="allRulenames")
  td: b-button.btn.btn-danger.float-right(@click="loeschen", :disabled="dirty"): b-icon-trash
  td: b-button.btn.btn-success.float-right(@click="save", :disabled="!dirty"): b-icon-check-square
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import HeftCalendar from "@/views/calendar/HeftCalendar.vue";
import Markdown from "@/widgets/Markdown.vue";
import JazzLabel from "@/widgets/JazzLabel.vue";
import JazzText from "@/widgets/JazzText.vue";
import MultiSelect from "@/widgets/MultiSelect.vue";
import MailRule, { allMailrules } from "../../../lib/mailsender/mailRule";
import SingleSelect from "@/widgets/SingleSelect.vue";
import SingleSelectPure from "@/widgets/SingleSelectPure.vue";
import { saveMailRule } from "@/commons/loader";

@Component({ components: { SingleSelectPure, SingleSelect, MultiSelect, JazzText, JazzLabel, HeftCalendar, Markdown } })
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

    const s = normCrLf(this.originalRule);
    const s1 = normCrLf(this.rule);
    console.log("S: " + s);
    console.log("S1: " + s1);
    this.dirty = s !== s1;
  }
}
</script>
