<template lang="pug">
  .v-md-container(:class="[css, { 'v-md-auto-resize': height === 'auto', 'v-md-fullscreen': fullScreen }]")
    .v-md-toolbar(v-if="toolbars.length > 0")
      .btn-group.mr-1(role="group" v-for="group in toolbars")
        button.btn.btn-sm(v-for="button in group", type="button", :title="button.title", :class="'btn-' + theme", @click="command(button.function, button.cmd)",
          :disabled="preview && !button.ready")
          i(:class="[button.ico]")
          span(v-if="button.text") &nbsp;{{button.text}}
    .v-md-wrapper(v-on:click="editor.focus()")
      textarea.v-md-editor(:style="styles", :id="id", :placeholder="placeholder", rows="10")
      .v-md-preview(v-if="preview", v-html="html")
</template>

<script lang="ts">
import CodeMirror, { EditorFromTextArea } from "codemirror";
import "codemirror/addon/display/fullscreen.js";
import "codemirror/mode/markdown/markdown.js";
import "codemirror/addon/display/placeholder.js";

import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Marked from "marked";

interface EditorConfiguration {
  fullScreen?: boolean;
}

interface Button {
  cmd: string;
  ico: string;
  title: string;
  hotkey?: string;
  ready?: boolean;
  function: (markdown: Markdown, ed: EditorFromTextArea) => void;
  text?: string;
}

function defaultButtons(): { [key: string]: Button } {
  return {
    undo: { cmd: "undo", ico: "fas far fa-undo", title: "Undo", hotkey: "Ctrl-Z", function: (md, ed) => ed.undo() },
    redo: { cmd: "redo", ico: "fas far fa-redo", title: "Redo", hotkey: "Ctrl-Y", function: (md, ed) => ed.redo() },
    bullist: { cmd: "bullist", ico: "fas fa-list-ul", title: "Liste", function: (md) => md._toggleLine("bullist") },
    numlist: { cmd: "numlist", ico: "fas fa-list-ol", title: "Aufzählung", function: (md) => md._toggleLine("numlist") },
    bold: { cmd: "bold", ico: "fas fa-bold", title: "Fett", hotkey: "Ctrl-B", function: (md) => md._toggleBlock("bold", "**") },
    italic: {
      cmd: "italic",
      ico: "fas fa-italic",
      title: "Kursiv",
      hotkey: "Ctrl-I",
      function: (md) => md._toggleBlock("italic", "*"),
    },
    strikethrough: {
      cmd: "strikethrough",
      ico: "fas fa-strikethrough",
      title: "durchgestrichen",
      function: (md) => md._toggleBlock("strikethrough", "~~"),
    },
    heading: {
      cmd: "heading",
      ico: "fas fa-heading",
      title: "Überschrift",
      hotkey: "Ctrl-H",
      function: (md, ed) => ed.replaceSelection("\n### " + ed.getSelection()),
    },
    code: { cmd: "code", ico: "fas fa-code", title: "Code", hotkey: "Ctrl-X", function: (md) => md._toggleBlock("code", "```") },
    quote: { cmd: "quote", ico: "fas fa-quote-left", title: "Zitat", hotkey: "Ctrl-Q", function: (md) => md._toggleLine("quote") },
    link: { cmd: "link", ico: "fas fa-link", title: "Link", hotkey: "Ctrl-K", function: (md) => md.drawLink() },
    image: { cmd: "image", ico: "far fa-image", title: "Bild", hotkey: "Ctrl-P", function: (md) => md.drawImage() },
    fullscreen: {
      cmd: "fullscreen",
      ico: "fas far fa-expand",
      title: "Vollbild",
      hotkey: "F11",
      ready: true,
      function: (md) => md.toggleFullscreen(),
    },
    preview: {
      cmd: "preview",
      ico: "fas far fa-eye",
      title: "Vorschau",
      hotkey: "Ctrl-P",
      ready: true,
      function: (md) => md.togglePreview(),
      text: "Vorschau",
    },
  };
}

@Component
export default class Markdown extends Vue {
  @Prop({
    type: String,
    default: () => `v-md-editor-${Math.random().toString(16).substr(2, 9)}`,
  })
  readonly id?: string;
  @Prop(String) css?: string;
  @Prop({ type: [String], default: "100%" }) readonly width?: string;
  @Prop({ type: [String], default: "300px" }) readonly height?: string;
  @Prop({
    type: String,
    default: "undo redo bold italic strikethrough heading | image link | numlist bullist code quote | preview fullscreen",
  })
  readonly toolbar?: string;
  @Prop({ type: String, default: "" }) readonly placeholder?: string;
  @Prop(Object) readonly extend?: object;
  @Prop({
    type: Object,
    default: defaultButtons,
  })
  readonly buttons?: { [key: string]: Button };
  @Prop({ type: String, default: "outline-secondary" }) readonly theme?: string;
  @Prop({ type: String, default: "", required: false }) readonly value?: string;
  @Prop({
    type: Object,
    default: () => {
      return { lineWrapping: true };
    },
  })
  readonly options?: EditorConfiguration;
  private editor?: EditorFromTextArea;
  private preview = false;
  private fullScreen = false;
  private toolbars: object[][] = [];
  private __rendered = false;

  get styles() {
    return {
      width: !/^\d+$/.test(this.width || "") ? this.width : `${this.width}px`,
      height: !/^\d+$/.test(this.height || "") ? this.height : `${this.height}px`,
    };
  }

  get html() {
    function enhanceTableTag(rendered: string): string {
      return rendered
        .replace(/<table>/g, '<table class="table table-condensed table-hover table-striped">')
        .replace(/<img src=/g, '<img class="img-responsive" src=');
    }

    const rendered = Marked(this.editor!.getValue(), { gfm: true, breaks: true, smartLists: true, pedantic: false });
    return enhanceTableTag(rendered);
  }

  @Watch("value")
  valueChanged(val: string) {
    if (val !== this.editor!.getValue()) {
      this.editor!.setValue(val);
    }
  }

  isEmpty(s?: string | null) {
    return !s || /^[\s\xa0]*$/.test(s);
  }

  isUrl(s?: string | null) {
    return !this.isEmpty(s) && /((http(s)?):\/\/\w+)/gi.test(s!);
  }

  _toggleBlock(type: string, token: string) {
    const ed = this.editor!;
    const startPoint = ed.getCursor("start");
    const endPoint = ed.getCursor("end");
    const stat = this.state();

    if (stat[type]) {
      const text = ed.getLine(startPoint.line);
      const tokenlength = token.length;

      const regtoken = token.replace(/\*/g, "\\*");
      const start = text.slice(0, startPoint.ch).replace(new RegExp(`(${regtoken})(?![\\s\\S]*(${regtoken}))`), "");
      const end = text.slice(startPoint.ch).replace(new RegExp(`(${regtoken})`), "");
      ed.replaceRange(start + end, { line: startPoint.line, ch: 0 }, { line: startPoint.line, ch: 99999999999999 });

      startPoint.ch -= tokenlength;
      if (startPoint !== endPoint) {
        endPoint.ch -= tokenlength;
      }
    } else {
      const text = ed.getSelection().split(token).join("");
      ed.replaceSelection(token + text + token);
      startPoint.ch += token.length;
      endPoint.ch = startPoint.ch + text.length;
    }

    ed.setSelection(startPoint, endPoint);
  }

  _toggleLine(name: string) {
    const ed = this.editor!;
    const stat = this.state();
    const startPoint = ed.getCursor("start");
    const endPoint = ed.getCursor("end");
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
      const text = stat[name] ? ed.getLine(i).replace(regex, "$1") : map[name] + ed.getLine(i);
      ed.replaceRange(text, { line: i, ch: 0 }, { line: i, ch: 99999999999999 });
    }
  }

  state() {
    const editorFromTextArea = this.editor!;
    const pos = editorFromTextArea.getCursor("start");
    const stat = editorFromTextArea.getTokenAt(pos);
    if (!stat.type) {
      return {};
    }

    function tag(format: string): string | undefined {
      const translationmap: { [key: string]: string } = {
        strong: "bold",
        "variable-2": /^\s*\d+\.\s/.test(editorFromTextArea.getLine(pos!.line)) ? "numlist" : "bullist",
        atom: "quote",
        em: "italic",
        quote: "quote",
        strikethrough: "strikethrough",
        comment: "code",
        link: "link",
        url: "link",
        image: "image",
      };
      return format.match(/^header(-[1-6])?$/) ? 'format.replace("header", "heading")' : translationmap[format];
    }
    const ret: any = {};
    stat.type
      .split(" ")
      .map(tag)
      .filter((each: string | undefined) => !!each)
      .forEach((tag: string) => (ret[tag!] = true));
    return ret;
  }

  _replaceSelection(active: boolean, startPattern: string, endPattern: string, val: { title: string; url: string }) {
    const ed = this.editor!;
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

  drawImage() {
    // eslint-disable-next-line no-alert
    const url: string | null = prompt("URL für das Bild eingeben", "https://");
    if (this.isUrl(url)) {
      const text = this.editor!.getSelection();
      const title = !this.isEmpty(text) ? text : "Bildertitel";
      this._replaceSelection(this.state().image, "![#title#](", '#url# "#title#")', { title: title, url: url! });
    }
  }

  drawLink() {
    // eslint-disable-next-line no-alert
    const url: string | null = prompt("URL für den Link eingeben", "https://");
    if (this.isUrl(url)) {
      const text = this.editor!.getSelection();
      const title = !this.isEmpty(text) ? text : url;
      this._replaceSelection(this.state().link, "[#title#]", '(#url# "#title#")', { title: title!, url: url! });
    }
  }

  togglePreview() {
    this.preview = !this.preview;
  }

  toggleFullscreen() {
    const ed = this.editor!;
    this.fullScreen = !this.fullScreen;
    ed.setOption("fullScreen", !ed.getOption("fullScreen"));
  }

  command(cb: Function, key: string) {
    this.$root.$emit("markdown-editor:" + key, this);
    cb(this, this.editor);
  }

  mounted() {
    if (this.__rendered) {
      return;
    }
    const buttons: any = Object.assign({}, this.buttons, this.extend);
    this.toolbars = this.toolbar!.split("|").map((groupDef) =>
      groupDef
        .toLowerCase()
        .split(/(\s)/)
        .filter((name) => !this.isEmpty(name))
        .map((name) => buttons[name])
    );
    const shortcuts: any = {};
    this.toolbars.forEach((group) =>
      (group as Button[])
        .filter((button: Button) => !this.isEmpty(button.hotkey))
        .forEach((button: Button) => (shortcuts[button.hotkey!] = button.function))
    );

    const o = Object.assign({ mode: { name: "markdown", strikethrough: true }, extraKeys: shortcuts }, this.options);

    const ed = (this.editor = CodeMirror.fromTextArea(document.getElementById(this.id!) as HTMLTextAreaElement, o));
    ed.setValue(this.value!);
    ed.setSize(this.width, this.height);
    ed.on("change", (ed: CodeMirror.EditorFromTextArea) => this.$emit("input", ed.getValue()));

    this.__rendered = true;
  }

  destroy() {
    this.editor!.toTextArea();
  }
}
</script>

<style></style>
