<template lang="pug">
.col-12
  .btn-group.float-right
  h1 Wiki Suchergebnisse<br>
    small für "{{ suchtext }}"

  h3(v-if="matches.length === 0") Keine Ergebnisse
  dl(v-else)
    .row(v-for="match in matches", :key="JSON.stringify(match)")
      dt.col-4
        b-link(:to="`/wiki/${match.pageName}`") {{ match.pageName }}
        span(v-if="match.line") #{ " " }(in Zeile {{ match.line }})
      dd.col-8(v-if="match.text"): em {{ match.text }}
      dd.col-8(v-else) (im Dateinamen)
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { searchWiki } from "../../commons/loader";

@Component
export default class WikiSearchresults extends Vue {
  @Prop() suchtext!: string;
  private matches: { pageName: string; line: string; text: string }[] = [];

  @Watch("$route")
  mounted(): void {
    document.title = "Suchergebnisse";
    searchWiki(
      this.suchtext,
      (err?: Error, result?: { searchtext: string; matches: { pageName: string; line: string; text: string }[] }) => {
        if (!err) {
          this.matches = result?.matches || [];
        }
      }
    );
  }
}
</script>
