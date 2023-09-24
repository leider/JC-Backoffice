import { marked } from "marked";
import misc from "./misc.js";

function normalize(str: string): string {
  if (str.trim() === "") {
    return "";
  }
  return misc.normalizeString(str);
}

marked.setOptions({
  gfm: true,
  breaks: true,
  pedantic: false,
});

function evalTags(text: string, subdir?: string): string {
  let result = text;
  const tagmap: { [index: string]: string } = {};

  // Yields the content with the rendered [[bracket tags]]
  // The rules are the same for Gollum https://github.com/github/gollum
  const matches = result.match(/(.?)\[\[(.+?)]]([^[]?)/g);
  if (matches) {
    matches.forEach((match) => {
      const tag = /(.?)\[\[(.+?)]](.?)/.exec(match.trim());
      if (!tag) {
        return;
      }
      if (tag[1] === "'") {
        return;
      }
      const id = encodeURIComponent(tag[2]);
      tagmap[id] = tag[2] || "";
      result = result.replace(tag[0] || "", id);
    });
  }
  Object.keys(tagmap).forEach((key) => {
    const parts = tagmap[key].split("|");
    const name = parts[0];
    const pageName = parts[1] || name;

    tagmap[key] = `<a class="internal" href="/wiki/${subdir || "alle"}/${normalize(pageName.toLowerCase())}">${name}</a>`;
    result = result.replace(new RegExp(key, "g"), tagmap[key]);
  });

  return result;
}

function enhanceTableTag(rendered: string): string {
  return rendered
    .replace(/<table>/g, '<table class="table table-condensed table-hover table-striped">')
    .replace(/<img src=/g, '<img class="img-responsive" src=');
}

export default {
  render: function render(content?: string, subdir?: string): string {
    if (content === undefined || content === null) {
      return "";
    }
    const rendered = marked(evalTags(content, subdir));
    return enhanceTableTag(rendered);
  },
  normalize,
  titleAndRenderedTail: function titleAndRenderedTail(content: string, subdir?: string): { title: string; body: string } {
    const tokens = marked.lexer(evalTags(content, subdir));
    if (tokens.length === 0) {
      return { title: "", body: "" };
    }
    const title = tokens.shift();
    const rendered = marked.parser(tokens);
    return {
      title: title && "text" in title ? title.text : "",
      body: enhanceTableTag(rendered),
    };
  },
};
