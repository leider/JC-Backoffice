<template lang="pug">
tr
  th: .form-control-plaintext {{ label }}
  td
    .input-group
      multi-select(v-model="section", :options="userids")
      .input-group-append
        .input-group-text.pl-1.pr-0
          b-form-checkbox(v-model="checked")
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import User from "../../../shared/user/user";
import Veranstaltung from "../../../shared/veranstaltung/veranstaltung";
import MultiSelect from "../../widgets/MultiSelect.vue";
import Staff, { StaffType } from "../../../shared/veranstaltung/staff";
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

  get userids(): string[] {
    return this.users.map((u) => u.id);
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
<style lang="scss" scoped>
.multiselect {
  width: calc(100% - 29px) !important;
}
.multiselect__tags {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}
</style>
