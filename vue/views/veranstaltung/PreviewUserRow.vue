<template lang="pug">
tr
  td(width="2%")
  td(width="98%")
    | {{user.name}} &nbsp;
    a(:href="`mailto:${user.email}`") {{user.email}}
    | {{ }} Tel.: &nbsp;
    a(:href="`tel:${user.tel}`") {{user.tel}}
    b(v-if="verantwortlich") {{ }} Verantwortlich

</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import User from "../../../lib/users/user";

@Component
export default class PreviewUserRow extends Vue {
  @Prop() user!: User;
  @Prop() verantwortlich!: boolean;
}
</script>
