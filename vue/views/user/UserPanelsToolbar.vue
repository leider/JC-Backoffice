<template lang="pug">
.row
  .col-12
    b-button.btn.btn-light.float-right(
      v-if="currentUser && currentUser.accessrights && currentUser.accessrights.isSuperuser",
      title="Neuer Benutzer",
      v-b-modal.dialog
    )
      b-icon-person-plus
      | #{" "}Neuer Benutzer
    ul.list-inline.mt-2
      li.list-inline-item
        b-icon-emoji-sunglasses
        | #{""} Admin
      li.list-inline-item
        b-icon-person-check
        | #{""} Booking
      li.list-inline-item
        b-icon-building
        | #{""} Orga
      li.list-inline-item
        b-icon-wallet2
        | #{""} Abendkasse
    b-modal#dialog(no-close-on-backdrop, @ok="createUser", @cancel="resetNewUser")
      .row
        .col-12
          jazz-text(label="User ID", v-model="newUser.id", required="true")
          jazz-pass(label="Passwort", v-model="newUser.password", required="true")
          jazz-text(label="Vollständiger Name", v-model="newUser.name")
          jazz-mail(label="E-Mail", v-model="newUser.email", required)
          jazz-text(label="Telefon", v-model="newUser.tel")
          single-select(label="T-Shirt", v-model="newUser.tshirt", :options="shirtsizes")
      .row
        .col-12
          single-select(label="Rechte", v-model="rechte", :options="alleRechte")
          jazz-check(label="Kassenfreigabe", v-model="kassenfreigabe")
      template(v-slot:modal-header)
        h3.modal-title Neuen User anlegen
      template(v-slot:modal-footer="{ ok, cancel }")
        .row
          .col-12
            .btn-group.float-right
              b-button.btn.btn-light(@click="cancel()") Abbrechen
              b-button.btn.btn-success.text(@click="ok()")
                b-icon-check-square
                | &nbsp;Speichern
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import User from "../../../backend/lib/users/user";
import JazzCheck from "@/widgets/JazzCheck.vue";
import SingleSelect from "@/widgets/SingleSelect.vue";
import JazzMail from "@/widgets/JazzMail.vue";
import JazzText from "@/widgets/JazzText.vue";
import SingleSelectPure from "@/widgets/SingleSelectPure.vue";
import { saveNewUser } from "@/commons/loader";
import JazzPass from "@/widgets/JazzPass.vue";

@Component({
  components: { JazzPass, JazzCheck, SingleSelect, JazzMail, JazzText, SingleSelectPure },
})
export default class UserPanelsToolbar extends Vue {
  @Prop() currentUser!: User;
  @Prop() users!: User[];

  private newUser = new User({ gruppen: [""] });

  private alleRechte = ["superusers", "bookingTeam", "orgaTeam", "abendkasse", ""];
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

  get rechte(): string {
    return this.newUser.gruppen[0];
  }

  set rechte(rechte: string) {
    this.newUser.gruppen = [rechte];
  }

  get kassenfreigabe(): boolean {
    return this.newUser.rechte[0] === "kassenfreigabe";
  }

  set kassenfreigabe(freigabe: boolean) {
    freigabe ? (this.newUser.rechte = ["kassenfreigabe"]) : (this.newUser.rechte = []);
  }

  resetNewUser(): void {
    this.newUser = new User({ gruppen: [""] });
  }
  createUser(): void {
    saveNewUser(this.newUser, (err?: Error) => {
      if (!err) {
        this.$emit("user-saved");
      }
    });
  }
}
</script>
