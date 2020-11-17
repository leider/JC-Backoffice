<template lang="pug">
.form-group
  jazz-label(label="Preisprofil")
  multiselect(
    :options="options",
    v-model="selected",
    :allowEmpty="false",
    :searchable="false",
    placeholder="Bitte wählen",
    selectLabel="",
    deselectLabel="",
    selectedLabel="",
    showLabels=false,
    label="text",
    track-by="name"
  )
    template(slot="singleLabel", slot-scope="props")
      span {{ props.option.name }}
        small &nbsp; {{ subtext(props.option) }}
    template(slot="option", slot-scope="props")
      span {{ props.option.name }}
        small &nbsp; {{ subtext(props.option) }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Preisprofil } from "../../../shared/optionen/optionValues";
import Multiselect from "vue-multiselect";
import JazzLabel from "../../widgets/JazzLabel.vue";

@Component({ components: { Multiselect, JazzLabel } })
export default class PreisSelect extends Vue {
  @Prop() value!: Preisprofil;
  @Prop() options!: Preisprofil[];

  get selected(): Preisprofil {
    return this.value;
  }

  set selected(profil: Preisprofil) {
    this.$emit("input", profil);
  }

  subtext(profil: Preisprofil): string {
    return `(${profil.regulaer},00, ${profil.regulaer - profil.rabattErmaessigt},00, ${profil.regulaer - profil.rabattMitglied},00)`;
  }
}
</script>
