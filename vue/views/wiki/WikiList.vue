<template lang="pug">
.col-12
  .btn-group.float-right
    b-form(@submit="search")
      b-input(placeholder="Wiki durchsuchen...", v-model="suchtext")
  h1 {{ subdir }}

  ul
    li(v-for="item in items", :key="item.fullname"): b-link(:to="'/wiki/' + item.fullname"): b {{ item.name }}
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { wikiSubdir } from "@/commons/loader";

@Component
export default class WikiList extends Vue {
  @Prop() subdir!: string;
  private items: { fullname: string; name: string }[] = [];
  private suchtext = "";

  search(event: Event) {
    event.preventDefault();
    if (this.suchtext.length < 2) {
      return;
    }
    this.$router.push({ path: `/wiki/searchresults/${this.suchtext}` });
    this.suchtext = "";
  }

  @Watch("subdir")
  subdirChanged() {
    document.title = `Wiki (${this.subdir})`;
    wikiSubdir(this.subdir, (items: { fullname: string; name: string }[]) => {
      this.items = items;
    });
  }

  mounted(): void {
    this.subdirChanged();
  }
}
</script>
