// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { EditorConfiguration } from "codemirror";
declare module "codemirror" {
  interface EditorConfiguration {
    // if true, it will be refreshed the first time the editor becomes visible.
    // you can pass delay (msec) time as polling duration
    fullScreen?: boolean;
  }
}
