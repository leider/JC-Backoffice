<template lang="pug">
.col-xl-3.col-lg-4.col-sm-6
  .card.mb-2.border-allgemeines
    h5.card-header.p-2.color-allgemeines
      a(@click="expanded = !expanded"): b
        b-icon-caret-down(v-if="expanded")
        b-icon-caret-right(v-else)
        | #{" "}
        b-icon(:icon="gruppenUndRechteIcon")
        | #{" "} {{ user.name }}
      .btn-group.float-right(v-if="canEdit")
        b-button.btn.btn-sm.btn.btn-light(v-b-modal="`dialog-${user.id}`", title="Bearbeiten")
          b-icon-pencil-square
        b-button.btn.btn-sm.btn.btn-light(v-b-modal="`pass-${user.id}`", title="Passwort ändern")
          b-icon-key-fill.text-success
        b-button.btn.btn-sm.btn-light(v-if="isSuperuser", v-b-modal="`delete-${user.id}`", title="Löschen")
          b-icon-trash.text-danger
      b-modal(:id="`dialog-${user.id}`", no-close-on-backdrop, @ok="saveUser", @cancel="resetUsers")
        .row: .col-12
          jazz-text(label="Vollständiger Name", v-model="user.name")
          jazz-mail(label="E-Mail", v-model="user.email", required)
          jazz-text(label="Telefon", v-model="user.tel")
          single-select(label="T-Shirt", v-model="user.tshirt", :options="shirtsizes")
        .row(v-if="isSuperuser"): .col-12
          single-select(label="Rechte", v-model="rechte", :options="alleRechte")
          jazz-check(v-if="!accessrights.isSuperuser", label="Kassenfreigabe", v-model="kassenfreigabe")
        template(v-slot:modal-header)
          h3.modal-title User "{{ user.id }}" bearbeiten
        template(v-slot:modal-footer="{ ok, cancel }")
          .row: .col-12: .btn-group.float-right
            b-button.btn.btn-light(@click="cancel()") Abbrechen
            b-button.btn.btn-success.text(@click="ok()")
              b-icon-check-square
              | &nbsp;Speichern
      b-modal(:id="`pass-${user.id}`", no-close-on-backdrop, @ok="changePassword", @cancel="resetPassfields")
        .row: .col-12
          p Beide Felder mit mindestens 6 Buchstaben identisch ausfüllen!
          jazz-pass-twice(v-model="newPass")
        template(v-slot:modal-header)
          h3.modal-title Passwort ändern
        template(v-slot:modal-footer="{ ok, cancel }")
          .row: .col-12: .btn-group.float-right
            b-button.btn.btn-light(@click="cancel()") Abbrechen
            b-button.btn.btn-success.text(@click="ok()", :disabled="newPass.length < 6")
              b-icon-check-square
              | &nbsp;Ändern
      delete-dialog(:id="user.id", :name="user.name", objecttype="User", :callback="deleteUser")

    b-collapse(v-model="expanded")
      table.table.table-striped.table-sm
        tbody
          tr
            th: .form-control-plaintext Username:
            td: .form-control-plaintext {{ user.id }}
          tr
            th: .form-control-plaintext E-Mail:
            td: .form-control-plaintext: a(:href="`mailto:${user.email}`") {{ user.email }}
          tr
            th: .form-control-plaintext T-Shirt:
            td: .form-control-plaintext {{ user.tshirt }}
          tr
            th: .form-control-plaintext Telefon:
            td: .form-control-plaintext: a(:href="`tel:${user.tel}`") {{ user.tel }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import User from "../../../lib/users/user";
import { deleteUser, saveUser, changePassword } from "@/commons/loader";
import Accessrights from "../../../lib/commons/accessrights";
import SingleSelectPure from "@/widgets/SingleSelectPure.vue";
import JazzText from "@/widgets/JazzText.vue";
import JazzMail from "@/widgets/JazzMail.vue";
import SingleSelect from "@/widgets/SingleSelect.vue";
import JazzCheck from "@/widgets/JazzCheck.vue";
import JazzPassTwice from "@/widgets/JazzPassTwice.vue";
import DeleteDialog from "@/widgets/DeleteDialog.vue";

@Component({
  components: { DeleteDialog, JazzPassTwice, JazzCheck, SingleSelect, JazzMail, JazzText, SingleSelectPure },
})
export default class UserPanel extends Vue {
  @Prop() currentUser!: User;
  @Prop() user!: User;
  private expanded = false;
  private shirtsizes = [
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

  private alleRechte = ["superusers", "bookingTeam", "orgaTeam", "abendkasse", ""];

  private newPass = "";

  get accessrights(): Accessrights {
    return new Accessrights(this.user);
  }

  get canEdit(): boolean {
    return !!this.currentUser.accessrights && this.currentUser.accessrights.canEditUser(this.user.id);
  }

  get isSuperuser(): boolean {
    return !!(this.currentUser && this.currentUser.accessrights && this.currentUser.accessrights.isSuperuser);
  }

  get emailstate(): boolean | null {
    const email = this.user.email;
    if (!email || email.length === 0) {
      return null;
    }
    const validEmail = !(email && !email.match(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/));
    return !!email && validEmail ? null : false;
  }

  get gruppenUndRechteIcon(): string {
    function highestGroup(rights: Accessrights): string {
      if (rights.isSuperuser) {
        return "emoji-sunglasses";
      }
      if (rights.isBookingTeam) {
        return "person-check";
      }
      if (rights.isOrgaTeam) {
        return "building";
      }
      if (rights.isAbendkasse) {
        return "wallet2";
      }
      return "";
    }
    return highestGroup(this.accessrights);
  }

  get rechte(): string {
    function highestGroup(rights: Accessrights): string {
      if (rights.isSuperuser) {
        return "superusers";
      }
      if (rights.isBookingTeam) {
        return "bookingTeam";
      }
      if (rights.isOrgaTeam) {
        return "orgaTeam";
      }
      if (rights.isAbendkasse) {
        return "abendkasse";
      }
      return "";
    }

    return highestGroup(this.accessrights);
  }

  set rechte(rechte: string) {
    this.user.gruppen = rechte ? [rechte] : [];
  }

  get kassenfreigabe(): boolean {
    return this.accessrights.darfKasseFreigeben;
  }

  set kassenfreigabe(freigabe: boolean) {
    if (this.accessrights.isSuperuser) {
      return;
    }
    freigabe ? (this.user.rechte = ["kassenfreigabe"]) : (this.user.rechte = []);
  }

  editlink(): string {
    return this.canEdit ? `/users/${encodeURIComponent(this.user.id)}` : "";
  }

  saveUser(): void {
    saveUser(this.user, () => {
      this.$emit("user-saved");
    });
  }

  deleteUser(): void {
    deleteUser(this.user, () => {
      this.$emit("user-saved");
    });
  }

  resetUsers(): void {
    this.$emit("reload-users");
  }

  changePassword(): void {
    console.log(this.newPass);
    this.user.password = this.newPass;
    console.log("User: " + this.user.password);
    changePassword(this.user, () => {
      this.$emit("user-saved");
    });
  }

  resetPassfields(): void {
    this.newPass = "";
  }
}
</script>
