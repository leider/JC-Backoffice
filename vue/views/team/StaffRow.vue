<template lang="pug">
tr
  th: .mt-1 {{ label }}
  td: .mt-1: span.text-capitalize {{ (section || []).join(', ') }}
  td.text-right
    b-button.btn.btn-success.btn-sm(v-if="!hasRegistered()", @click="add", title="Ich kann"): b-icon-plus-circle-fill
    b-button.btn.btn-danger.btn-sm(v-else, @click="remove", title="Ich kann nicht"): b-icon-dash-circle-fill
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import User from "../../../lib/users/user";
import Staff, { StaffType } from "../../../lib/veranstaltungen/object/staff";
import { addUserToSection, removeUserFromSection } from "@/commons/loader";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";

@Component
export default class StaffRow extends Vue {
  @Prop() sectionName!: StaffType;
  @Prop() label!: string;
  @Prop() veranstaltung!: Veranstaltung;
  @Prop() user!: User;

  get section(): string[] {
    return this.staff.getStaffCollection(this.sectionName);
  }

  get staff(): Staff {
    return this.veranstaltung.staff;
  }

  hasRegistered(): boolean {
    return this.section.map((name) => name.toLowerCase()).includes(this.user.id.toLowerCase());
  }

  add(): void {
    addUserToSection(this.veranstaltung, this.sectionName, (err: Error) => {
      if (!err) {
        this.staff.addUserToSection(this.user, this.sectionName);
      }
    });
  }

  remove(): void {
    removeUserFromSection(this.veranstaltung, this.sectionName, (err: Error) => {
      if (!err) {
        this.staff.removeUserFromSection(this.user, this.sectionName);
      }
    });
  }
}
</script>
