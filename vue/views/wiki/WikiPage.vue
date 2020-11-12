<template lang="pug">
.col-12
  .btn-group.float-right
    b-form(@submit="search")
      b-input(placeholder="Wiki durchsuchen...", v-model="suchtext")
    b-button(variant="primary", @click="edit", :disabled="isEdit")
      b-icon-file-earmark-text
      | #{" "} Bearbeiten
    b-button(@click="undo", :disabled="!isEdit")
      b-icon-file-earmark-text
      | #{" "} Undo
    b-button(variant="success", @click="save", :disabled="!dirty")
      b-icon-check-square
      | #{" "} Speichern
    delete-button-with-dialog#delete-wikipage(:name="page", objecttype="Seite", :callback="loeschen", :dirty="dirty", show-text="true")
  h1 Wiki<br>
    small
      b-link(:to="`/wiki/${subdir}`") "{{ subdir }}
      | #{" "}/ {{ page }}"
  markdown(v-if="isEdit", v-model="content", height="600px")
  div(v-else, v-html="body")
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Renderer from "../../../lib/commons/renderer";
import { deleteWikiPage, saveWikiPage, wikiPage } from "@/commons/loader";
import Markdown from "@/widgets/Markdown.vue";
import DeleteButtonWithDialog from "@/widgets/DeleteButtonWithDialog.vue";
@Component({
  components: { DeleteButtonWithDialog, Markdown },
})
export default class WikiPage extends Vue {
  @Prop() subdir!: string;
  @Prop() page!: string;
  private originalContent = "";
  private content = "";
  private isEdit = false;
  private suchtext = "";

  get body(): string {
    return Renderer.render(this.content, this.subdir);
  }

  search(event: Event) {
    event.preventDefault();
    if (this.suchtext.length < 2) {
      return;
    }
    this.$router.push({ path: `/wiki/searchresults/${this.suchtext}` });
    this.suchtext = "";
  }

  edit() {
    this.isEdit = true;
  }

  undo() {
    this.content = this.originalContent;
    this.isEdit = false;
  }

  save() {
    saveWikiPage(this.subdir, this.page, this.content, (err?: Error) => {
      if (!err) {
        this.originalContent = this.content;
        this.isEdit = false;
      }
    });
  }

  loeschen() {
    deleteWikiPage(this.subdir, this.page, (err?: Error) => {
      if (!err) {
        this.$router.push(`/wiki/${this.subdir}`);
      }
    });
  }

  get dirty(): boolean {
    return this.originalContent !== this.content;
  }

  @Watch("page")
  pageChanged() {
    document.title = `${this.page} : (${this.subdir})`;
    wikiPage(this.subdir, this.page, (content: string) => {
      this.originalContent = content;
      this.content = content;
    });
  }

  mounted(): void {
    this.pageChanged();
  }
}
</script>
