import marked from 'marked';
import crypto from 'crypto';
import iconv from 'iconv-lite';

function normalize(str: string) {
  if (str.trim() === '') {
    return '';
  }
  // iconv-lite cannot do this yet, so we do it manually:
  const withoutUmlauts = str
    .replace(/[äÄàáÀÁâÂ]/gi, 'a')
    .replace(/[èéÈÉêÊ]/gi, 'e')
    .replace(/[ìíÌÍîÎ]/gi, 'i')
    .replace(/[öÖòóÒÓôÔ]/gi, 'o')
    .replace(/[üÜùúÙÚûÛ]/gi, 'u')
    .replace(/ß/g, 's');
  return iconv
    .decode(Buffer.from(withoutUmlauts, 'utf-8'), 'utf8')
    .trim()
    .replace(/\s/g, '-')
    .replace(/\//g, '-')
    .replace(/[^a-zA-Z0-9\- _]/g, '')
    .toLowerCase();
}

marked.setOptions({
  gfm: true,
  breaks: true,
  smartLists: true,
  pedantic: false,
  sanitize: false // To be able to add iframes
});

function evalTags(text: string, subdir?: string) {
  let result = text;
  const tagmap: { [index: string]: string } = {};

  // Yields the content with the rendered [[bracket tags]]
  // The rules are the same for Gollum https://github.com/github/gollum
  const matches = result.match(/(.?)\[\[(.+?)\]\]([^[]?)/g);
  if (matches) {
    for (let match of matches) {
      const tag = /(.?)\[\[(.+?)\]\](.?)/.exec(match.trim());
      if (!tag) {
        continue;
      }
      if (tag[1] === "'") {
        continue;
      }
      const id = crypto
        .createHash('sha1')
        .update(tag[2])
        .digest('hex');
      tagmap[id] = tag[2] || '';
      result = result.replace(tag[0] || '', id);
    }
  }
  Object.keys(tagmap).forEach(key => {
    const parts = tagmap[key].split('|');
    const name = parts[0];
    const pageName = parts[1] || name;

    tagmap[key] = `<a class="internal" href="/wiki/${subdir ||
      'alle'}/${normalize(pageName.toLowerCase())}">${name}</a>`;
    result = result.replace(new RegExp(key, 'g'), tagmap[key]);
  });

  return result;
}

function enhanceTableTag(rendered: string) {
  return rendered
    .replace(
      /<table>/g,
      '<table class="table table-condensed table-hover table-striped">'
    )
    .replace(/<img src=/g, '<img class="img-responsive" src=');
}

export default {
  render: function render(content?: string, subdir?: string) {
    if (content === undefined || content === null) {
      return '';
    }
    const rendered = marked(evalTags(content, subdir));
    return enhanceTableTag(rendered);
  },
  normalize,
  titleAndRenderedTail: function titleAndRenderedTail(
    content: string,
    subdir?: string
  ) {
    const tokens = marked.lexer(evalTags(content, subdir));
    if (tokens.length === 0) {
      return { title: '', body: '' };
    }
    const title = tokens.shift();
    const rendered = marked.parser(tokens);
    return {
      title: title && 'text' in title ? title.text : '',
      body: enhanceTableTag(rendered)
    };
  }
};
