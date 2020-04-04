<template lang="pug">
.col-xl-3.col-lg-4.col-sm-6
  .card.mb-2.border-allgemeines
    h5.card-header.p-2.color-allgemeines
      a(@click="expanded = !expanded"): b
        i.far.fa-fw.fa-lg(:class="{'fa-caret-square-right': !expanded, 'fa-caret-square-down': expanded}")
        | {{user.name}} ({{user.id}})
        small #{""} Gruppen: {{gruppenUndRechteText()}}
    b-collapse(v-model="expanded")
      table.table.table-striped.table-sm
        tbody
          tr(v-if="canEdit"): td(colspan=2): a.btn.btn-sm.btn-primary.float-right(:href="editlink()", title="Bearbeiten"): i.fas.fa-fw.fa-edit
          tr
            th: .form-control-plaintext E-Mail:
            td: .mailtoify.form-control-plaintext {{user.email}}
          tr(v-if="canEdit")
            th: .form-control-plaintext T-Shirt:
            td: b-form-select(v-model="user.tshirt", :options="shirtsizes", size="sm", style="width:100%", @change="saveUser")
          tr(v-if="canEdit")
            th: .form-control-plaintext Telefon:
            td: b-form-input(type="text", v-model="user.tel", size="sm", style="width:100%", @blur="saveUser")

          tr(v-if="!canEdit")
            th: .form-control-plaintext T-Shirt:
            td: .form-control-plaintext {{user.tshirt}}
          tr(v-if="!canEdit")
            th: .form-control-plaintext Telefon:
            td: .telify.form-control-plaintext {{user.tel}}
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import User from "../../../lib/users/user";
import { saveUser } from "@/commons/loader";
import Accessrights from "../../../lib/commons/accessrights";

@Component
export default class UserPanel extends Vue {
  @Prop() currentUser!: User;
  @Prop() user!: User;
  private expanded = this.user.id === this.currentUser.id;

  get accessrights(): Accessrights {
    return this.currentUser.accessrights;
  }

  get shirtsizes(): string[] {
    return [
      "",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "XXXL",
      "No Shirt",
      "Ladies' XS",
      "Ladies' S",
      "Ladies' M",
      "Ladies' L",
      "Ladies' XL",
      "Ladies' XXL",
    ];
  }

  get canEdit(): boolean {
    return this.accessrights.canEditUser(this.user.id);
  }

  gruppenUndRechteText(): string {
    const tokens = this.user.rechte ? this.user.gruppen.concat(this.user.rechte) : this.user.gruppen;
    if (tokens.length > 0) {
      return tokens.map((gruppe: string) => gruppe.substring(0, 1).toLocaleUpperCase()).join(", ");
    }
    return "-";
  }

  editlink(): string {
    return this.accessrights.canEditUser(this.user.id) ? `/users/${encodeURIComponent(this.user.id)}` : "";
  }

  saveUser(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    saveUser(this.user, (res: any) => {
      this.$emit("userSaved", new User(res));
    });
  }
}
</script>
