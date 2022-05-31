<template lang="pug">
.col-12
  h2 Beleg Hochladen
  .row
    .col-12.col-xl-6
      h4 Einen Beleg direkt an die Buchhaltung schicken
      p Denk daran, uns den Beleg noch im Original zukommen zu lassen.
      p Entweder...
      ul
        li ... gibst Du ihn direkt an der Abendkasse ab, oder
        li ... Du schickst Ihn an die Büroadresse
      legend-card(title="Beleg")
        .form-group
          label Belegdatei (oder Fotografieren):
          .input-group
            b-form-file(v-model="fileForUpload", accept="image/*", placeholder="Beleg...", browse-text="Auswählen/Aufnehmen")
            .input-group-append
              b-button(@click="saveFiles", variant="primary", :disabled="fileForUpload === null") Hochladen
        jazz-date(label="Datum des Belegs", v-model="datum")
        jazz-textarea(label="Kommentar", v-model="kommentar")
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Markdown from "../../widgets/Markdown.vue";
import LegendCard from "@/widgets/LegendCard.vue";
import { uploadBeleg } from "@/commons/loader";
import JazzDate from "@/widgets/JazzDate.vue";
import JazzTextarea from "@/widgets/JazzTextarea.vue";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { feedbackMessages } from "@/views/general/FeedbackMessages";

@Component({ components: { Markdown, LegendCard, JazzDate, JazzTextarea } })
export default class Belege extends Vue {
  private fileForUpload: File | null = null;
  private datum: Date = new Date();
  private kommentar = "";

  async saveFiles() {
    if (!this.kommentar || this.kommentar.trim().length < 1) {
      return feedbackMessages.addError("Angabe fehlt", "Du musst einen Kommentar eingeben!");
    }
    if (!this.fileForUpload) {
      return feedbackMessages.addError("Angabe fehlt", "Belegdatei nicht vorhanden!");
    } else {
      const formData = new FormData();
      formData.append("datei", this.fileForUpload, this.fileForUpload.name);
      formData.append("datum", DatumUhrzeit.forJSDate(this.datum).tagMonatJahrLang);
      formData.append("kommentar", this.kommentar);
      await uploadBeleg(formData);
      this.fileForUpload = null;
      this.datum = new Date();
      this.kommentar = "";
    }
  }
}
</script>
