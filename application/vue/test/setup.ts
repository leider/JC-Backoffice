/* eslint-disable no-console */
import { vi } from "vitest";

import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import noop from "lodash/noop";
import constant from "lodash/constant";
import some from "lodash/some";
import isString from "lodash/isString";

expect.extend(matchers);

/// <reference types="vitest" />

import "@testing-library/jest-dom/vitest";

afterEach(async () => {
  const { profilerEnabled, profilerStats } = await import("./pure/harness");
  if (profilerEnabled && profilerStats.renders > 0) {
    const avg = (profilerStats.totalMs / profilerStats.renders).toFixed(1);
    console.log(`⏱ ${profilerStats.renders} renders, ${profilerStats.totalMs.toFixed(0)}ms total, ${avg}ms avg`);
    profilerStats.renders = 0;
    profilerStats.totalMs = 0;
  }
  cleanup();
  // Drain React scheduler's chained setImmediate callbacks before JSDOM tears down window
  for (let i = 0; i < 10; i++) {
    await new Promise<void>((r) => {
      setImmediate(r);
    });
  }
});

vi.mock("@/commons/useDirtyBlocker", () => ({
  useDirtyBlocker: noop,
}));

// Deep antd/es/ imports create separate module instances under Vitest,
// breaking React context sharing with <Form>. Redirect to the barrel export.
vi.mock("antd/es/form/hooks/useFormInstance", async () => {
  const { Form } = await vi.importActual<typeof import("antd")>("antd");
  return { default: Form.useFormInstance };
});

vi.mock("antd/es/form/hooks/useFormItemStatus", async () => {
  const { Form } = await vi.importActual<typeof import("antd")>("antd");
  return { default: Form.Item.useStatus };
});

vi.mock("antd/es/form/Form", async () => {
  const antd = await vi.importActual<typeof import("antd")>("antd");
  return {
    default: antd.Form,
    useForm: antd.Form.useForm,
    useWatch: antd.Form.useWatch,
    List: antd.Form.List,
  };
});

vi.mock("@mdxeditor/editor", () => ({
  MDXEditor: constant(null),
  MDXEditorMethods: undefined,
  headingsPlugin: constant({}),
  listsPlugin: constant({}),
  quotePlugin: constant({}),
  thematicBreakPlugin: constant({}),
  markdownShortcutPlugin: constant({}),
  toolbarPlugin: constant({}),
  diffSourcePlugin: constant({}),
  DiffSourceToggleWrapper: ({ children }: { children: React.ReactNode }) => children,
  BoldItalicUnderlineToggles: constant(null),
  UndoRedo: constant(null),
  ListsToggle: constant(null),
  BlockTypeSelect: constant(null),
  CreateLink: constant(null),
  InsertImage: constant(null),
  InsertTable: constant(null),
  InsertThematicBreak: constant(null),
  linkPlugin: constant({}),
  linkDialogPlugin: constant({}),
  imagePlugin: constant({}),
  tablePlugin: constant({}),
  codeBlockPlugin: constant({}),
  codeMirrorPlugin: constant({}),
  sandpackPlugin: constant({}),
  SandpackConfig: undefined,
}));

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// AntD Table virtual scroll (rc-virtual-list) measures the container via
// offsetHeight / clientHeight / scrollHeight which JSDOM leaves at 0.
// Without these mocks any re-render causes the virtual list to unmount all rows.
Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, get: constant(800) });
Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: constant(800) });
Object.defineProperty(HTMLElement.prototype, "scrollHeight", { configurable: true, get: constant(800) });
Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get: constant(1400) });
Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: constant(1400) });
Element.prototype.getBoundingClientRect = vi.fn(
  () =>
    ({
      width: 1400,
      height: 800,
      top: 0,
      left: 0,
      bottom: 800,
      right: 1400,
      x: 0,
      y: 0,
      toJSON: noop,
    }) as DOMRect,
);

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("min-width"),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// @ts-expect-error React Testing Library needs this flag to enable act() support
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Stub canvas so JSDOM doesn't log "Not implemented: HTMLCanvasElement's getContext()"
HTMLCanvasElement.prototype.getContext = constant(null) as never;

// JSDOM doesn't support pseudo-elements in getComputedStyle and logs "Not implemented".
// Dropping the pseudo arg silences the warning without changing observable behavior.
const _origGCS = window.getComputedStyle;
window.getComputedStyle = ((elt: Element) => _origGCS(elt)) as typeof window.getComputedStyle;

// Filter known JSDOM/AntD noise from test output
const suppressedPatterns = [/not wrapped in act/, /Could not parse CSS stylesheet/, /Not implemented/, /`maskClosable` is deprecated/];

function isSuppressed(args: unknown[]): boolean {
  return some(args, (_val, i) => i === 0 && isString(args[0]) && some(suppressedPatterns, (p) => p.test(args[0] as string)));
}

const _origError = console.error;
const _origWarn = console.warn;
console.error = (...args: unknown[]) => {
  if (!isSuppressed(args)) _origError(...args);
};
console.warn = (...args: unknown[]) => {
  if (!isSuppressed(args)) _origWarn(...args);
};

// JSDOM "Not implemented" and CSS parsing errors go to process.stderr directly,
// bypassing console. Intercept that channel too.
const _origStderrWrite = process.stderr.write.bind(process.stderr) as typeof process.stderr.write;
process.stderr.write = ((chunk: string | Uint8Array, ...rest: unknown[]) => {
  const str = isString(chunk) ? chunk : new TextDecoder().decode(chunk);
  if (some(suppressedPatterns, (p) => p.test(str))) return true;
  return (_origStderrWrite as (...a: unknown[]) => boolean)(chunk, ...rest);
}) as typeof process.stderr.write;
