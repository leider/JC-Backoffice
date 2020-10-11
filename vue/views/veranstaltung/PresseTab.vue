<template lang="pug">
.row
  .col-12
    legend-card(section="presse", title="Pressematerial")
      .row.mb-3
        .col-12.col-md-3
          jazz-check(v-model="presse.checked", label="Ist so OK")
      .row
        .col-md-6
          jazz-text(label="URL-Suffix bei jazzclub.de", v-model="presse.jazzclubURL")
          b-tabs(v-model="tabIndex")
            b-tab(title="Finaler Text", :title-link-class="titlelinkclass(0)")
              .form-group
                jazz-label(label="Formatierter Text für die Pressemitteilung")
                markdown(v-model="presse.text", height="500px")
            b-tab(title="Originaler Text", :title-link-class="titlelinkclass(1)")
              .form-group
                jazz-label(label="Unredigierter Text, wie er bei uns ankam")
                markdown(v-model="presse.originalText", height="500px")
          .form-group
            label Fotos für die Presse:
            .input-group
              b-form-file(v-model="filesForUpload", multiple, placeholder="Dateien auswählen", accept="image/*", browse-text="Auswählen")
              .input-group-append
                b-button(@click="saveFiles", variant="primary", :disabled="filesForUpload.length === 0") Hochladen
            .row.mt-3
              .col-12(v-for="datei in presse.image", :key="datei")
                .form-inline
                  span(v-b-popover.hover="hoverOptions(datei)") {{ datei }}
                  a.ml-1(@click="presse.removeImage(datei)", v-b-tooltip.hover, title="Aus Dateien enfernen")
                    b-icon-file-earmark-x(font-scale="1.2")
          single-select(label="Vorhandene Bilder", v-model="existingImage", :options="allImageNames")
        .col-md-6
          div(v-html="preview")
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import LegendCard from "@/widgets/LegendCard.vue";
import JazzCheck from "@/widgets/JazzCheck.vue";
import { uploadFile } from "@/commons/loader";
import JazzLabel from "@/widgets/JazzLabel.vue";
import JazzText from "@/widgets/JazzText.vue";
import Presse from "../../../lib/veranstaltungen/object/presse";
import Markdown from "@/widgets/Markdown.vue";
import Renderer from "../../../lib/commons/renderer";
import SingleSelect from "@/widgets/SingleSelect.vue";

@Component({
  components: {
    SingleSelect,
    Markdown,
    JazzText,
    JazzLabel,
    JazzCheck,
    LegendCard,
  },
})
export default class PresseTab extends Vue {
  @Prop() veranstaltung!: Veranstaltung;
  @Prop() allImageNames!: string[];

  private tabIndex = 0;
  private filesForUpload: File[] = [];
  private existingImage: string | null = null;

  get presse(): Presse {
    return this.veranstaltung.presse;
  }

  hoverOptions(image: string): object {
    const url = `/image/imagepreview/${image}`;
    return {
      title: image,
      content: `<img src='${url}' alt='bild' width="100%">`,
      html: true,
      placement: "right",
    };
  }

  titlelinkclass(idx: number): string[] {
    return ["font-weight-bold", this.tabIndex === idx ? "color-presse" : "tab-presse"];
  }

  get preview(): string {
    return (
      Renderer.render(`${this.veranstaltung.presseTemplate() + this.presse.text}
${this.presse.fullyQualifiedJazzclubURL()}`) +
      `<h4>Bilder:</h4>${this.presse.image
        .map((i) => `<p><img src="/image/imagepreview/${i}" width="100%"></p>`)
        .reverse()
        .join("")}`
    );
  }

  @Watch("existingImage")
  uebernehmeImage(img?: string): void {
    if (img) {
      this.presse.updateImage(img);
      this.existingImage = null;
    }
  }

  saveFiles(): void {
    const formData = new FormData();
    formData.append("id", this.veranstaltung.id || "");
    formData.append("typ", "pressefoto");
    this.filesForUpload.forEach((file) => {
      formData.append("datei", file, file.name);
    });
    uploadFile(formData, (json: { error?: string; veranstaltung?: any }) => {
      if (!json.error) {
        this.filesForUpload = [];
        const strings = this.presse.image;
        strings.splice(0, strings.length);
        const newStrings = new Veranstaltung(json.veranstaltung).presse.image;
        newStrings.forEach((s) => strings.push(s));
      }
    });
  }
}
</script>
