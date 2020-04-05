<template lang="pug">
  tr
    th: .form-control-plaintext {{label}}
    td
      .input-group
        multi-select(v-model="section", :options="userids", style="width:90%!important")
        .input-group-append
          .input-group-text.pl-1.pr-0
            b-form-checkbox(v-model="checked")
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import User from "../../../lib/users/user";
import Staff, { StaffType } from "../../../lib/veranstaltungen/object/staff";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import MultiSelect from "@/widgets/MultiSelect.vue";
@Component({
  components: { MultiSelect },
})
export default class StaffRowAdmin extends Vue {
  @Prop() sectionName!: StaffType;
  @Prop() label!: string;
  @Prop() veranstaltung!: Veranstaltung;
  @Prop() users!: User[];

  get section(): string[] {
    return this.staff.getStaffCollection(this.sectionName);
  }

  set section(value: string[]) {
    this.staff.setStaffCollection(this.sectionName, value);
  }

  get userids() {
    return this.users.map(u => u.id);
  }

  get staff(): Staff {
    return this.veranstaltung.staff;
  }

  get checked(): boolean {
    return !this.staff.getStaffNotNeeded(this.sectionName);
  }
  set checked(check: boolean) {
    this.staff.setStaffNotNeeded(this.sectionName, !check);
  }
}
</script>
