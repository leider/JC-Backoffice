<template lang="pug">
legend-card(section="allgemeines", :title="title")
  table.table.table-sm.table-striped
    tbody
      tr
        th(style="width: 50%") Bild
        th Veranstaltung
      tr(v-for="row in rows", :key="row.image")
        td(style="white-space: nowrap")
          .input-group
            b-form-input(v-model="row.newname")
            .input-group-append
              .input-group-text(v-b-popover.hover="hoverOptions(row.image)")
                b-icon-eyeglasses(scale="1.5")
        td
          span.form-control-plaintext(v-for="v in row.veranstaltungen", :key="v.id")
            a.font-weight-bold(:href="`/vue${v.fullyQualifiedUrl}/presse`") {{ v.titel }}
            | &nbsp; {{ v.startDate.tagMonatJahrKompakt }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import LegendCard from "../../widgets/LegendCard.vue";
import { ImageOverviewRow } from "jc-shared/veranstaltung/veranstaltung";

@Component({
  components: { LegendCard },
})
export default class ImageOverviewSection extends Vue {
  @Prop() rows!: ImageOverviewRow[];
  @Prop() title!: string;

  hoverOptions(image: string): { title: string; content: string; html: boolean; placement: string } {
    const url = `/imagepreview/${image}`;
    return {
      title: image,
      content: `<img src='${url}' alt='bild' width="100%">`,
      html: true,
      placement: "right",
    };
  }
}
</script>
