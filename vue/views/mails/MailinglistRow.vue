<template lang="pug">
tr
  td: b-form-input(v-model="mailinglist.name")
  td: multi-select(v-model="selectedUsers", :options="allUsernames")
  td: b-button.btn.btn-danger.float-right(:disabled="dirty", v-b-modal="`dialog-${mailinglist.originalName}`")
    b-icon-trash
    b-modal(:id="`dialog-${mailinglist.originalName}`", no-close-on-backdrop, @ok="loeschen")
      p Bist Du sicher, dass Du {{ mailinglist.name }} löschen willst?
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
import User from "../../../lib/users/user";
import MultiSelect from "@/widgets/MultiSelect.vue";
import { Mailingliste } from "../../../lib/users/users";
import { saveMailinglist } from "@/commons/loader";

@Component({ components: { MultiSelect } })
export default class MailinglistRow extends Vue {
  private originallist!: Mailingliste;
  @Prop() mailinglist!: Mailingliste;
  @Prop() users!: User[];

  private dirty = false;

  get selectedUsers(): string[] {
    return this.mailinglist.users.map((u) => u.name);
  }

  set selectedUsers(names: string[]) {
    this.mailinglist.users = this.users.filter((u) => names.includes(u.name));
  }

  get allUsernames() {
    return this.users.map((u) => u.name);
  }

  created(): void {
    this.listChanged();
  }

  loeschen(): void {
    this.$emit("loeschen");
  }

  save(): void {
    saveMailinglist(this.mailinglist, () => {
      this.mailinglist.originalName = this.mailinglist.name;
      this.listChanged();
      this.somethingChanged();
    });
  }

  @Watch("mailinglist")
  listChanged() {
    this.originallist = new Mailingliste(this.mailinglist.name, [...this.mailinglist.users]);
  }

  @Watch("selectedUsers")
  @Watch("mailinglist.name")
  somethingChanged(): void {
    function normCrLf(json: object): string {
      return JSON.stringify(json).replace(/\\r\\n/g, "\\n");
    }

    this.dirty = normCrLf(this.originallist) !== normCrLf(this.mailinglist);
  }
}
</script>
