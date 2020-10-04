<template lang="pug">
.form-group
  jazz-label(label="Typ")
  multiselect(
    :options="optionObjects",
    v-model="selected",
    :state="valid",
    :allowEmpty="false",
    :searchable="false",
    placeholder="Bitte wählen",
    selectLabel="",
    deselectLabel="",
    selectedLabel="",
    showLabels=false,
    :openDirection="openDirection",
    label="text",
    track-by="text"
  )
    template(slot="singleLabel", slot-scope="props")
      span(:class="props.option.icon")
      span(:class="props.option.color") &nbsp;{{ props.option.text }}
    template(slot="option", slot-scope="props")
      span(:class="props.option.icon")
      span(:class="props.option.color") &nbsp;{{ props.option.text }}
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Multiselect from "vue-multiselect";
import fieldHelpers from "../../lib/commons/fieldHelpers";
import JazzLabel from "@/widgets/JazzLabel.vue";

@Component({ components: { JazzLabel, Multiselect } })
export default class EventTypSelect extends Vue {
  @Prop() value!: string;
  @Prop() options!: string[];
  @Prop() readonly required!: boolean;
  @Prop() openDirection!: string;
  valid: boolean | null = null;

  get selected(): { text: string; color: string; icon: string } {
    return this.objectForValue(this.value);
  }

  set selected(val: { text: string; color: string; icon: string }) {
    this.$emit("input", val.text);
  }

  get optionObjects(): { text: string; color: string; icon: string }[] {
    return this.options.map((o) => this.objectForValue(o));
  }

  objectForValue(value: string): { text: string; color: string; icon: string } {
    return {
      text: value,
      color: `text-${fieldHelpers.cssColorCode(value)}`,
      icon: fieldHelpers.cssIconClass(value),
    };
  }

  mounted(): void {
    this.validate();
  }

  updated(): void {
    this.validate();
  }

  @Watch("selected")
  validate(): void {
    if (this.required !== undefined) {
      if (this.selected.text === "") {
        this.valid = false;
      } else {
        this.valid = null;
      }
    }
  }
}
</script>
