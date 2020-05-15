<template lang="pug">
  .v-md-container(:class="[css, { 'v-md-auto-resize': height === 'auto', 'v-md-fullscreen': fullScreen }]")
    .v-md-toolbar(v-if="toolbars.length > 0")
      .btn-group.mr-1(role="group" v-for="group in toolbars")
        button.btn.btn-sm(v-for="button in group", type="button", :title="button.title", :class="'btn-' + theme", @click="button.function(md)",
          :disabled="preview && !button.ready")
          i(:class="[button.ico]")
          span(v-if="button.text") &nbsp;{{button.text}}
    .v-md-wrapper(v-on:click="editor.focus()")
      textarea.v-md-editor(:style="styles", :id="id", rows="10")
      .v-md-preview(v-if="preview", v-html="html()")
      b-modal(v-model="showHelp", size="lg", title="Markdown Cheatsheet", title-tag="h3", ok-only, ok-title="Schließen")
        .modal-body
          .row
            .col-md-4.pr-1
              .card
                h4.card-header.p-1 Format Text
                .card-body.p-1
                  h5.card-title Headers
                  pre.
                    # This is an &lt;h1&gt; tag
                    ## This is an &lt;h2&gt; tag
                    ###### This is an &lt;h6&gt; tag
                  h5.card-title Text styles
                  pre.
                    *This text will be italic*
                    _This will also be italic_
                    **This text will be bold**
                    __This will also be bold__
                    *You **can** combine them*
            .col-md-3.px-1
              .card
                h4.card-header.p-1 Lists
                .card-body.p-1
                  h5.card-title Unordered
                  pre.
                    * Item 1
                    * Item 2
                    * Item 2a
                    * Item 2b
                  h5.card-title Ordered
                  pre.
                    1. Item 1
                    2. Item 2
                    3. Item 3
                       * Item 3a
                       * Item 3b
            .col-md-5.pl-1
              .card
                h4.card-header.p-1 Miscellaneous
                .card-body.p-1
                  h5.card-title Images
                  pre.
                    ![GitHub Logo](/images/logo.png)
                    Format: ![Alt Text](url)
                  h5.card-title Links
                  pre.
                    http://github.com - automatic!
                    [GitHub](http://github.com)
                  h5.card-title Blockquotes
                  pre.
                    As Kanye West said:
                    &gt; We're living the future so
                    &gt; the present is our past.
</template>

<script lang="ts">
import CodeMirror, { Editor, EditorFromTextArea } from "codemirror";
import "codemirror/addon/display/fullscreen";
import "codemirror/mode/markdown/markdown";
import "codemirror/mode/gfm/gfm";
import "codemirror/addon/display/placeholder";

import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Marked from "marked";

interface EditorConfiguration {
  fullScreen?: boolean;
}

interface Button {
  ico: string;
  title: string;
  function: (markdown: Markdown) => void;
  ready?: boolean;
  text?: string;
}

function defaultButtons(): { [key: string]: Button } {
  return {
    undo: { ico: "fas far fa-undo", title: "Undo", function: (md): void => md.editor.undo() },
    redo: { ico: "fas far fa-redo", title: "Redo", function: (md): void => md.editor.redo() },
    bullist: { ico: "fas fa-list-ul", title: "Liste", function: (md): void => md._toggleLine("bullist") },
    numlist: { ico: "fas fa-list-ol", title: "Aufzählung", function: (md): void => md._toggleLine("numlist") },
    bold: { ico: "fas fa-bold", title: "Fett", function: (md): void => md._toggleBlock("bold", "**") },
    italic: { ico: "fas fa-italic", title: "Kursiv", function: (md): void => md._toggleBlock("italic", "*") },
    strikethrough: {
      ico: "fas fa-strikethrough",
      title: "durchgestrichen",
      function: (md): void => md._toggleBlock("strikethrough", "~~"),
    },
    heading: {
      ico: "fas fa-heading",
      title: "Überschrift",
      function: (md): void => md.editor.replaceSelection("\n### " + md.editor.getSelection()),
    },
    code: { ico: "fas fa-code", title: "Code", function: (md): void => md._toggleBlock("code", "```") },
    quote: { ico: "fas fa-quote-left", title: "Zitat", function: (md): void => md._toggleLine("quote") },
    link: { ico: "fas fa-link", title: "Link", function: (md): void => md.drawLink() },
    image: { ico: "far fa-image", title: "Bild", function: (md): void => md.drawImage() },
    fullscreen: { ico: "fas far fa-expand", title: "Vollbild", function: (md): void => md.toggleFullscreen(), ready: true },
    preview: { ico: "fas far fa-eye", title: "Vorschau", function: (md): void => md.togglePreview(), ready: true, text: "Vorschau" },
    help: {
      ico: "fas fa-question-circle",
      title: "Hilfe",
      function: (md): void => {
        md.showHelp = !md.showHelp;
      },
      ready: true,
    },
  };
}

@Component
export default class Markdown extends Vue {
  @Prop({
    type: String,
    default: () => `v-md-editor-${Math.random().toString(16).substr(2, 9)}`,
  })
  @Prop(String)
  id!: string;
  @Prop(String) css?: string;
  @Prop({ type: [String], default: "100%" }) readonly width!: string;
  @Prop({ type: [String], default: "300px" }) readonly height!: string;
  @Prop({
    type: String,
    default: "undo redo bold italic strikethrough heading | image link | numlist bullist code quote | preview fullscreen",
  })
  toolbar!: string;
  @Prop({
    type: Object,
    default: defaultButtons,
  })
  readonly buttons!: { [key: string]: Button };
  @Prop({ type: String, default: "outline-secondary" }) readonly theme!: string;
  @Prop({ type: String, default: "", required: false }) readonly value!: string;
  @Prop({
    type: Object,
    default: () => {
      return { lineWrapping: true };
    },
  })
  readonly options!: EditorConfiguration;
  editor!: EditorFromTextArea;
  private preview = false;
  private fullScreen = false;
  private __rendered = false;
  showHelp = false;

  get md(): Markdown {
    return this;
  }

  get toolbars(): Button[][] {
    return this.toolbar.split("|").map((groupDef) =>
      groupDef
        .toLowerCase()
        .split(/(\s)/)
        .filter((name) => !this.isEmpty(name))
        .map((name) => this.buttons[name])
    );
  }

  get styles(): { width: string; height: string } {
    return {
      width: !/^\d+$/.test(this.width || "") ? this.width : `${this.width}px`,
      height: !/^\d+$/.test(this.height || "") ? this.height : `${this.height}px`,
    };
  }

  html(): string {
    function enhanceTableTag(rendered: string): string {
      return rendered
        .replace(/<table>/g, '<table class="table table-condensed table-hover table-striped">')
        .replace(/<img src=/g, '<img class="img-responsive" src=');
    }

    const rendered = Marked(this.editor.getValue(), { gfm: true, breaks: true, smartLists: true, pedantic: false });
    return enhanceTableTag(rendered);
  }

  @Watch("value")
  valueChanged(val: string): void {
    if (val !== this.editor.getValue()) {
      this.editor.setValue(val);
    }
  }

  isEmpty(s?: string | null): boolean {
    return !s || /^[\s\xa0]*$/.test(s);
  }

  isUrl(s?: string | null): boolean {
    return !this.isEmpty(s) && /((http(s)?):\/\/\w+)/gi.test(s || "");
  }

  _toggleBlock(type: string, token: string): void {
    const startPoint = this.editor.getCursor("start");
    const endPoint = this.editor.getCursor("end");
    const stat = this.state();

    if (stat[type]) {
      const text = this.editor.getLine(startPoint.line);
      const tokenlength = token.length;

      const regtoken = token.replace(/\*/g, "\\*");
      const start = text.slice(0, startPoint.ch).replace(new RegExp(`(${regtoken})(?![\\s\\S]*(${regtoken}))`), "");
      const end = text.slice(startPoint.ch).replace(new RegExp(`(${regtoken})`), "");
      this.editor.replaceRange(start + end, { line: startPoint.line, ch: 0 }, { line: startPoint.line, ch: 99999999999999 });

      startPoint.ch -= tokenlength;
      if (startPoint !== endPoint) {
        endPoint.ch -= tokenlength;
      }
    } else {
      const text = this.editor.getSelection().split(token).join("");
      this.editor.replaceSelection(token + text + token);
      startPoint.ch += token.length;
      endPoint.ch = startPoint.ch + text.length;
    }

    this.editor.setSelection(startPoint, endPoint);
  }

  _toggleLine(name: string): void {
    const stat = this.state();
    const startPoint = this.editor.getCursor("start");
    const endPoint = this.editor.getCursor("end");
    const symbol: { [key: string]: string } = {
      quote: ">",
      bullist: "([*])",
      numlist: "1\\.",
    };
    const regex = new RegExp(`^(\\s*)${symbol[name]}\\s+`);

    const map: { [key: string]: string } = {
      quote: "> ",
      bullist: "* ",
      numlist: "1. ",
    };
    for (let i = startPoint.line; i <= endPoint.line; i++) {
      const text = stat[name] ? this.editor.getLine(i).replace(regex, "$1") : map[name] + this.editor.getLine(i);
      this.editor.replaceRange(text, { line: i, ch: 0 }, { line: i, ch: 99999999999999 });
    }
  }

  state(): { [index: string]: boolean } {
    const editorFromTextArea = this.editor;
    const pos = editorFromTextArea.getCursor("start");
    const stat = editorFromTextArea.getTokenAt(pos);
    if (!stat.type) {
      return {};
    }

    function tag(format: string): string {
      const translationmap: { [key: string]: string } = {
        strong: "bold",
        "variable-2": /^\s*\d+\.\s/.test(editorFromTextArea.getLine(pos.line)) ? "numlist" : "bullist",
        atom: "quote",
        em: "italic",
        quote: "quote",
        strikethrough: "strikethrough",
        comment: "code",
        link: "link",
        url: "link",
        image: "image",
      };
      return format.match(/^header(-[1-6])?$/) ? format.replace("header", "heading") : translationmap[format] || "";
    }
    const ret: { [index: string]: boolean } = {};
    stat.type
      .split(" ")
      .map(tag)
      .filter((each) => each !== "")
      .forEach((tag) => (ret[tag] = true));
    return ret;
  }

  _replaceSelection(active: boolean, startPattern: string, endPattern: string, val: { title: string; url: string }): void {
    const ed = this.editor;
    const startPoint = ed.getCursor("start");
    const endPoint = ed.getCursor("end");

    if (active) {
      const text = ed.getLine(startPoint.line);
      const replacement = text.slice(0, startPoint.ch) + text.slice(startPoint.ch);
      ed.replaceRange(replacement, { line: startPoint.line, ch: 0 });
    } else {
      const start = startPattern.replace("#title#", val.title);
      const end = endPattern.replace("#title#", val.title).replace("#url#", val.url);
      ed.replaceSelection(start + end);
      startPoint.ch += start.length;
      if (startPoint !== endPoint) {
        endPoint.ch += start.length;
      }
    }
    ed.setSelection(startPoint, endPoint);
  }

  drawImage(): void {
    // eslint-disable-next-line no-alert
    const url: string | null = prompt("URL für das Bild eingeben", "https://");
    if (this.isUrl(url)) {
      const text = this.editor.getSelection();
      const title = !this.isEmpty(text) ? text : "Bildertitel";
      this._replaceSelection(this.state().image, "![#title#](", '#url# "#title#")', { title: title, url: url || "" });
    }
  }

  drawLink(): void {
    // eslint-disable-next-line no-alert
    const url: string | null = prompt("URL für den Link eingeben", "https://");
    if (this.isUrl(url)) {
      const text = this.editor.getSelection();
      const title = !this.isEmpty(text) ? text : url || "";
      this._replaceSelection(this.state().link, "[#title#]", '(#url# "#title#")', { title: title, url: url || "" });
    }
  }

  togglePreview(): void {
    this.preview = !this.preview;
  }

  toggleFullscreen(): void {
    this.fullScreen = !this.fullScreen;
    this.editor.setOption("fullScreen", !this.editor.getOption("fullScreen"));
  }

  mounted(): void {
    if (this.__rendered) {
      return;
    }

    const o = Object.assign({ mode: { name: "gfm" } }, this.options);

    const ed = (this.editor = CodeMirror.fromTextArea(document.getElementById(this.id) as HTMLTextAreaElement, o));
    ed.setValue(this.value);
    ed.setSize(this.width, this.height);
    ed.on("change", (ed: Editor) => this.$emit("input", ed.getValue()));

    this.__rendered = true;
  }

  destroy(): void {
    this.editor.toTextArea();
  }
}
</script>
