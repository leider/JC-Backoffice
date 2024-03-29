import pug from "pug";

import Renderer from "jc-shared/commons/renderer.js";

export default class MailBodyRenderer {
  private markdown: string;

  constructor(markdown: string) {
    this.markdown = markdown;
  }

  get rendered(): string {
    return Renderer.render(this.markdown);
  }

  get html(): string {
    return pug.render(
      `doctype html
html: body !{content}
`,
      { pretty: true, content: this.rendered },
    );
  }

  get text(): string {
    return this.markdown;
  }
}
