<template lang="pug">
tr
  td: b-form-input(v-model="mailinglist.name")
  td: multi-select(v-model="selectedUsers", :options="allUsernames")
  td: delete-button-with-dialog(
    :id="mailinglist.originalName",
    :name="mailinglist.name",
    objecttype="Liste",
    :callback="loeschen",
    :dirty="dirty"
  )
  td: b-button.btn.btn-success.float-right(@click="save", :disabled="!dirty"): b-icon-check-square
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import User from "../../../shared/user/user";
import MultiSelect from "../../widgets/MultiSelect.vue";
import { Mailingliste } from "../../../shared/user/users";
import { saveMailinglist } from "../../commons/loader";
import DeleteButtonWithDialog from "../../widgets/DeleteButtonWithDialog.vue";

@Component({ components: { DeleteButtonWithDialog, MultiSelect } })
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
    saveMailinglist(this.mailinglist, (err?: Error) => {
      if (!err) {
        this.mailinglist.originalName = this.mailinglist.name;
        this.listChanged();
        this.somethingChanged();
      }
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
